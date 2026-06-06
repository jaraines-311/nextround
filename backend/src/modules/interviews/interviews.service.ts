import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreditsService } from '../credits/credits.service';
import { INTERVIEW_SYSTEM_PROMPT } from '../ai/prompts/interview.prompts';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { InterviewMode, InterviewStatus, InterviewType } from '@prisma/client';

@Injectable()
export class InterviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly credits: CreditsService,
    private readonly config: ConfigService,
  ) {}

  async create(userId: string, dto: CreateInterviewDto) {
    const questionCost = this.credits.getCostForFeature('question_generation');

    const canAfford = await this.credits.canAfford(userId, questionCost);
    if (!canAfford) throw new ForbiddenException('Insufficient AI credits to start an interview');

    const session = await this.prisma.interviewSession.create({
      data: {
        userId,
        resumeId: dto.resumeId,
        jobId: dto.jobId,
        type: dto.type,
        mode: dto.mode,
        status: InterviewStatus.IN_PROGRESS,
        title: dto.title || `${dto.type} Interview`,
      },
    });

    const firstQuestion = await this.generateNextQuestion(userId, session.id, []);

    return { session, firstQuestion };
  }

  async submitAnswer(userId: string, sessionId: string, dto: SubmitAnswerDto) {
    const session = await this.prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
      include: { turns: { orderBy: { turnNumber: 'asc' } } },
    });
    if (!session) throw new NotFoundException('Interview session not found');
    if (session.status !== InterviewStatus.IN_PROGRESS) {
      throw new BadRequestException('Interview is not in progress');
    }

    const questionCost = this.credits.getCostForFeature('question_generation');
    const canAfford = await this.credits.canAfford(userId, questionCost);
    if (!canAfford) throw new ForbiddenException('Insufficient AI credits to continue');

    // Record the user's answer
    const userTurn = await this.prisma.interviewTurn.create({
      data: {
        sessionId,
        turnNumber: session.turns.length + 1,
        role: 'user',
        content: dto.answer,
        durationSeconds: dto.durationSeconds,
        audioUrl: dto.audioUrl,
      },
    });

    // Build conversation history
    const history = session.turns.map((t) => ({ role: t.role, content: t.content }));
    history.push({ role: 'user', content: dto.answer });

    // Generate follow-up question
    const nextQuestion = await this.generateNextQuestion(userId, sessionId, history);

    await this.prisma.interviewSession.update({
      where: { id: sessionId },
      data: { turnCount: { increment: 2 } },
    });

    return { userTurn, nextQuestion };
  }

  async complete(userId: string, sessionId: string) {
    const session = await this.prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new NotFoundException('Interview session not found');

    await this.prisma.interviewSession.update({
      where: { id: sessionId },
      data: { status: InterviewStatus.COMPLETED, completedAt: new Date() },
    });

    return { message: 'Interview completed', sessionId };
  }

  async findOne(userId: string, sessionId: string) {
    const session = await this.prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        turns: { orderBy: { turnNumber: 'asc' } },
        feedbackReport: true,
        job: true,
        resume: { select: { id: true, name: true } },
      },
    });
    if (!session) throw new NotFoundException('Interview session not found');
    return session;
  }

  async findAll(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [sessions, total] = await this.prisma.$transaction([
      this.prisma.interviewSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { feedbackReport: { select: { overallScore: true } }, job: { select: { title: true, company: true } } },
      }),
      this.prisma.interviewSession.count({ where: { userId } }),
    ]);

    return { data: sessions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  private async generateNextQuestion(userId: string, sessionId: string, history: Array<{ role: string; content: string }>) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        job: true,
        resume: true,
        user: { include: { candidateProfile: true } },
      },
    });

    const profile = session.user.candidateProfile;
    const resume = session.resume;
    const job = session.job;

    const systemPrompt = INTERVIEW_SYSTEM_PROMPT
      .replace('{{interviewType}}', session.type)
      .replace('{{industry}}', session.user.targetIndustry)
      .replace('{{seniorityLevel}}', job?.seniorityLevel ?? 'MID')
      .replace('{{resumeSummary}}', resume?.parsedSummary ?? 'Not provided')
      .replace('{{targetRole}}', job?.title ?? 'Software Engineer')
      .replace('{{skills}}', (profile?.skills ?? []).join(', ') || 'Not specified')
      .replace('{{jobTitle}}', job?.title ?? 'Not specified')
      .replace('{{company}}', job?.company ?? 'Not specified')
      .replace('{{jobRequirements}}', (job?.requiredSkills ?? []).join(', ') || 'Not specified');

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    ];

    if (history.length === 0) {
      messages.push({ role: 'user', content: 'Please ask me the first interview question.' });
    } else {
      messages.push({
        role: 'user',
        content: 'Based on my answer, please ask the next most relevant question.',
      });
    }

    const questionCost = this.credits.getCostForFeature('question_generation');
    const result = await this.ai.complete({ messages, temperature: 0.8 });

    await this.credits.consume({
      userId,
      amount: questionCost,
      feature: 'question_generation',
      sessionId,
      tokensUsed: result.tokensUsed,
      providerCostUsd: result.providerCostUsd,
      aiProvider: result.provider,
      aiModel: result.model,
    });

    let questionContent = result.content;
    try {
      const parsed = JSON.parse(result.content);
      questionContent = parsed.question || result.content;
    } catch {}

    const turn = await this.prisma.interviewTurn.create({
      data: {
        sessionId,
        turnNumber: history.length + 1,
        role: 'assistant',
        content: questionContent,
        tokensUsed: result.tokensUsed,
        creditsConsumed: questionCost,
        aiProvider: result.provider as any,
        aiModel: result.model,
      },
    });

    await this.prisma.interviewSession.update({
      where: { id: sessionId },
      data: { totalCreditsUsed: { increment: questionCost } },
    });

    return { turn, content: questionContent };
  }
}
