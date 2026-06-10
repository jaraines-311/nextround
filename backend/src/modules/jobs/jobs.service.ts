import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreditsService } from '../credits/credits.service';
import { JOB_ANALYSIS_PROMPT, JOB_MATCH_ANALYSIS_PROMPT } from '../ai/prompts/interview.prompts';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CreateJobInterviewDto } from './dto/create-job-interview.dto';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly credits: CreditsService,
  ) {}

  async create(userId: string, dto: CreateJobDto) {
    const jobCost = this.credits.getCostForFeature('job_analysis');
    const canAfford = await this.credits.canAfford(userId, jobCost);

    let parsedMetadata: any = null;

    if (canAfford) {
      try {
        const prompt = JOB_ANALYSIS_PROMPT.replace('{{jobDescription}}', dto.rawDescription);
        parsedMetadata = await this.ai.completeJson({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
        });

        await this.credits.consume({
          userId,
          amount: jobCost,
          feature: 'job_analysis',
          tokensUsed: undefined,
          providerCostUsd: undefined,
        });
      } catch {}
    }

    return this.prisma.job.create({
      data: {
        userId,
        title: dto.title || parsedMetadata?.title || 'Untitled Job',
        company: dto.company || parsedMetadata?.company,
        rawDescription: dto.rawDescription,
        requiredSkills: dto.requiredSkills ?? parsedMetadata?.requiredSkills ?? [],
        preferredSkills: dto.preferredSkills ?? parsedMetadata?.preferredSkills ?? [],
        seniorityLevel: dto.seniorityLevel ?? parsedMetadata?.seniorityLevel ?? 'MID',
        salaryMin: dto.salaryMin ?? null,
        salaryMax: dto.salaryMax ?? null,
        targetAsk: dto.targetAsk ?? null,
        sourceUrl: dto.sourceUrl ?? null,
        status: dto.status ?? 'INTERESTED',
        appliedAt: dto.appliedAt ? new Date(dto.appliedAt) : null,
        parsedMetadata,
      },
    });
  }

  async findAllWithInterviews(userId: string) {
    return this.prisma.job.findMany({
      where: { userId },
      include: { jobInterviews: { orderBy: { scheduledAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneWithInterviews(userId: string, id: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, userId },
      include: { jobInterviews: { orderBy: { scheduledAt: 'asc' } } },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async getUpcomingInterviews(userId: string) {
    return this.prisma.jobInterview.findMany({
      where: {
        userId,
        status: 'SCHEDULED',
        scheduledAt: { gte: new Date() },
      },
      include: { job: { select: { id: true, title: true, company: true } } },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    });
  }

  async createInterview(userId: string, jobId: string, dto: CreateJobInterviewDto) {
    await this.findOne(userId, jobId);
    return this.prisma.jobInterview.create({
      data: {
        jobId,
        userId,
        type: dto.type ?? 'GENERAL',
        status: dto.status ?? 'SCHEDULED',
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        notes: dto.notes ?? null,
      },
    });
  }

  async updateInterview(userId: string, interviewId: string, dto: Partial<CreateJobInterviewDto>) {
    const record = await this.prisma.jobInterview.findFirst({ where: { id: interviewId, userId } });
    if (!record) throw new NotFoundException('Interview not found');
    return this.prisma.jobInterview.update({
      where: { id: interviewId },
      data: {
        ...(dto.type && { type: dto.type }),
        ...(dto.status && { status: dto.status }),
        ...(dto.scheduledAt !== undefined && { scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status === 'COMPLETED' && { completedAt: new Date() }),
      },
    });
  }

  async deleteInterview(userId: string, interviewId: string) {
    const record = await this.prisma.jobInterview.findFirst({ where: { id: interviewId, userId } });
    if (!record) throw new NotFoundException('Interview not found');
    await this.prisma.jobInterview.delete({ where: { id: interviewId } });
    return { message: 'Deleted' };
  }

  async fetchFromUrl(url: string) {
    let html: string;
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NextRound/1.0)',
          'Accept': 'text/html,application/xhtml+xml',
        },
        timeout: 10000,
        maxContentLength: 2 * 1024 * 1024,
      });
      html = response.data as string;
    } catch {
      throw new BadRequestException('Could not fetch that URL. The site may block automated requests — try pasting the job description instead.');
    }

    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 12000);

    if (text.length < 200) {
      throw new BadRequestException('Not enough text found at that URL. The page may require a login or JavaScript — try pasting the job description instead.');
    }

    try {
      const prompt = JOB_ANALYSIS_PROMPT.replace('{{jobDescription}}', text);
      const parsed = await this.ai.completeJson<any>({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });
      return { rawDescription: text, ...parsed };
    } catch {
      return { rawDescription: text };
    }
  }

  async findAll(userId: string) {
    return this.prisma.job.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const job = await this.prisma.job.findFirst({ where: { id, userId } });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async update(userId: string, id: string, dto: UpdateJobDto) {
    await this.findOne(userId, id);
    return this.prisma.job.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.job.delete({ where: { id } });
    return { message: 'Job deleted' };
  }

  async getJobAnalysis(userId: string, jobId: string) {
    await this.findOne(userId, jobId);
    const analysis = await this.prisma.jobAnalysis.findUnique({ where: { jobId } });
    if (!analysis) return null;

    let isStale = false;
    if (analysis.resumeId) {
      const resume = await this.prisma.resume.findUnique({
        where: { id: analysis.resumeId },
        select: { updatedAt: true },
      });
      if (resume && analysis.resumeUpdatedAt) {
        isStale = resume.updatedAt.getTime() > new Date(analysis.resumeUpdatedAt).getTime();
      }
    }

    return { ...analysis, isStale };
  }

  async analyzeJobMatch(userId: string, jobId: string) {
    const COST = this.credits.getCostForFeature('job_match_analysis');

    const canAfford = await this.credits.canAfford(userId, COST);
    if (!canAfford) {
      throw new ForbiddenException(`Insufficient AI credits. This analysis costs ${COST} credits.`);
    }

    const job = await this.findOne(userId, jobId);

    const resume = await this.prisma.resume.findFirst({
      where: { userId, isActive: true },
      orderBy: { updatedAt: 'desc' },
    });
    if (!resume) {
      throw new BadRequestException('Upload a resume before running a match analysis.');
    }

    const prompt = JOB_MATCH_ANALYSIS_PROMPT
      .replace('{{resumeText}}', resume.rawText.slice(0, 8000))
      .replace('{{jobDescription}}', job.rawDescription.slice(0, 6000))
      .replace('{{jobTitle}}', job.title)
      .replace('{{company}}', job.company ?? 'Not specified')
      .replace('{{requiredSkills}}', (job.requiredSkills as string[]).join(', ') || 'Not specified');

    const result = await this.ai.completeJson<any>({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      maxTokens: 3000,
    });

    // Normalise — guard against wrong root key or mis-nested response
    const root = result?.analysis ?? result ?? {};

    const toStringArray = (v: any): string[] => {
      if (!Array.isArray(v)) return [];
      return v.flatMap((item) => {
        if (typeof item === 'string' && item.trim()) return [item.trim()];
        if (typeof item === 'object' && item !== null) {
          const area = item.area || item.skill || item.section || item.title || item.name || '';
          const detail = item.evidence || item.gap || item.description || item.suggested || item.tip || item.text || item.reason || '';
          const text = area && detail ? `${area}: ${detail}` : area || detail || '';
          return text.trim() ? [text.trim()] : [];
        }
        return [];
      });
    };

    const data = {
      resumeId: resume.id,
      resumeUpdatedAt: resume.updatedAt,
      matchScore: Math.min(100, Math.max(0, root.matchScore ?? root.match_score ?? 50)),
      matchLabel: root.matchLabel || root.match_label || root.label || 'Partial Match',
      summary: root.summary || root.overview || root.description || '',
      strengths: toStringArray(root.strengths),
      weaknesses: toStringArray(root.gaps || root.weaknesses || root.areasToImprove || root.areas_to_improve),
      tailoringTips: toStringArray(root.recommendations || root.tailoringTips || root.tailoring_tips || root.tips),
      creditsConsumed: COST,
    };

    const analysis = await this.prisma.jobAnalysis.upsert({
      where: { jobId },
      create: { jobId, userId, ...data },
      update: data,
    });

    await this.credits.consume({
      userId,
      amount: COST,
      feature: 'job_match_analysis',
      metadata: { jobId },
    });

    return { ...analysis, isStale: false };
  }
}
