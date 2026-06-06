import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto';

@Injectable()
export class CandidateProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Candidate profile not found');
    return profile;
  }

  async update(userId: string, dto: UpdateCandidateProfileDto) {
    return this.prisma.candidateProfile.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });
  }
}
