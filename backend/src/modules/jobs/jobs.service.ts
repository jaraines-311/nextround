import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreditsService } from '../credits/credits.service';
import { JOB_ANALYSIS_PROMPT } from '../ai/prompts/interview.prompts';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

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
        parsedMetadata,
      },
    });
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
}
