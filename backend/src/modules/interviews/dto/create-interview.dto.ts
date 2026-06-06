import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InterviewMode, InterviewType } from '@prisma/client';

export class CreateInterviewDto {
  @ApiProperty({ enum: InterviewType })
  @IsEnum(InterviewType)
  type: InterviewType;

  @ApiProperty({ enum: InterviewMode })
  @IsEnum(InterviewMode)
  mode: InterviewMode;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  resumeId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  jobId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;
}
