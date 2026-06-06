import { Injectable, NotFoundException } from '@nestjs/common';
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
        parsedMetadata,
      },
    });
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
