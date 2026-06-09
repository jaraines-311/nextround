import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JobInterviewType, JobInterviewStatus } from '@prisma/client';

export class CreateJobInterviewDto {
  @ApiPropertyOptional({ enum: JobInterviewType })
  @IsEnum(JobInterviewType)
  @IsOptional()
  type?: JobInterviewType;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ enum: JobInterviewStatus })
  @IsEnum(JobInterviewStatus)
  @IsOptional()
  status?: JobInterviewStatus;
}
