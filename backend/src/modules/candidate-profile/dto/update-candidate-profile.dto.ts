import { IsArray, IsEnum, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Industry } from '@prisma/client';

export class UpdateCandidateProfileDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  yearsOfExperience?: number;

  @ApiPropertyOptional({ enum: Industry })
  @IsEnum(Industry)
  @IsOptional()
  targetIndustry?: Industry;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  targetRoles?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  strengths?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  weaknesses?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  userNotes?: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  linkedinUrl?: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  githubUrl?: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  portfolioUrl?: string;
}
