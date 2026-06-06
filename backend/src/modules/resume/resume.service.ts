import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreditsService } from '../credits/credits.service';
import { RESUME_ANALYSIS_PROMPT } from '../ai/prompts/interview.prompts';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';

@Injectable()
export class ResumeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly credits: CreditsService,
  ) {}

  async create(userId: string, dto: CreateResumeDto) {
    const resumeCost = this.credits.getCostForFeature('resume_analysis');
    const canAfford = await this.credits.canAfford(userId, resumeCost);

    let parsedSkills: string[] = [];
    let parsedSummary: string = null;

    if (canAfford) {
      try {
        const prompt = RESUME_ANALYSIS_PROMPT.replace('{{resumeText}}', dto.rawText);
        const parsed = await this.ai.completeJson<any>({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
        });

        parsedSkills = parsed.skills ?? [];
        parsedSummary = parsed.summary;

        await this.credits.consume({
          userId,
          amount: resumeCost,
          feature: 'resume_analysis',
        });

        // Update candidate profile skills
        await this.prisma.candidateProfile.updateMany({
          where: { userId },
          data: { skills: parsedSkills, summary: parsedSummary },
        });
      } catch {}
    }

    // Deactivate other resumes
    await this.prisma.resume.updateMany({ where: { userId }, data: { isActive: false } });

    return this.prisma.resume.create({
      data: {
        userId,
        name: dto.name,
        rawText: dto.rawText,
        fileUrl: dto.fileUrl,
        fileName: dto.fileName,
        fileMimeType: dto.fileMimeType,
        parsedSkills,
        parsedSummary,
        isActive: true,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const resume = await this.prisma.resume.findFirst({ where: { id, userId } });
    if (!resume) throw new NotFoundException('Resume not found');
    return resume;
  }

  async update(userId: string, id: string, dto: UpdateResumeDto) {
    await this.findOne(userId, id);
    return this.prisma.resume.update({ where: { id }, data: dto });
  }

  async setActive(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.resume.updateMany({ where: { userId }, data: { isActive: false } });
    return this.prisma.resume.update({ where: { id }, data: { isActive: true } });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.resume.delete({ where: { id } });
    return { message: 'Resume deleted' };
  }
}
