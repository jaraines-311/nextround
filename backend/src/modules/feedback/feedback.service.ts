import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreditsService } from '../credits/credits.service';
import { FEEDBACK_SYSTEM_PROMPT } from '../ai/prompts/interview.prompts';

interface FeedbackPayload {
  overallScore: number;
  communicationScore: number;
  technicalDepthScore: number;
  roleFitScore: number;
  confidenceScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestedAnswers: Record<string, string>;
  studyTopics: string[];
  followUpQuestions: string[];
}

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly credits: CreditsService,
  ) {}

  async generate(userId: string, sessionId: string) {
    const session = await this.prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
      include: { turns: { orderBy: { turnNumber: 'asc' } }, feedbackReport: true, job: true },
    });
    if (!session) throw new NotFoundException('Interview session not found');
    if (session.feedbackReport) throw new ConflictException('Feedback already generated for this session');

    const feedbackCost = this.credits.getCostForFeature('feedback_report');
    const canAfford = await this.credits.canAfford(userId, feedbackCost);
    if (!canAfford) throw new ForbiddenException('Insufficient AI credits to generate feedback');

    // Build transcript
    const transcript = session.turns
      .map((t) => `${t.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${t.content}`)
      .join('\n\n');

    const messages = [
      { role: 'system' as const, content: FEEDBACK_SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: `Evaluate this interview transcript for a ${session.type} interview:\n\n${transcript}`,
      },
    ];

    const result = await this.ai.completeJson<FeedbackPayload>({ messages, temperature: 0.3 });

    await this.credits.consume({
      userId,
      amount: feedbackCost,
      feature: 'feedback_report',
      sessionId,
      tokensUsed: undefined,
      providerCostUsd: undefined,
    });

    const report = await this.prisma.feedbackReport.create({
      data: {
        userId,
        sessionId,
        overallScore: result.overallScore,
        communicationScore: result.communicationScore,
        technicalDepthScore: result.technicalDepthScore,
        roleFitScore: result.roleFitScore,
        confidenceScore: result.confidenceScore,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        suggestedAnswers: result.suggestedAnswers,
        studyTopics: result.studyTopics,
        followUpQuestions: result.followUpQuestions,
        rawFeedbackJson: result as any,
        creditsConsumed: feedbackCost,
      },
    });

    return report;
  }

  async findBySession(userId: string, sessionId: string) {
    const report = await this.prisma.feedbackReport.findFirst({
      where: { sessionId, userId },
      include: { session: { select: { type: true, mode: true, createdAt: true, job: true } } },
    });
    if (!report) throw new NotFoundException('Feedback report not found');
    return report;
  }

  async findAll(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reports, total] = await this.prisma.$transaction([
      this.prisma.feedbackReport.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { session: { select: { type: true, job: { select: { title: true } } } } },
      }),
      this.prisma.feedbackReport.count({ where: { userId } }),
    ]);

    return { data: reports, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
