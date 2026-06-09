import { IsArray, IsEnum, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeniorityLevel } from '@prisma/client';

export class CreateJobDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty()
  @IsString()
  rawDescription: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  requiredSkills?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  preferredSkills?: string[];

  @ApiPropertyOptional({ enum: SeniorityLevel })
  @IsEnum(SeniorityLevel)
  @IsOptional()
  seniorityLevel?: SeniorityLevel;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  salaryMin?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  salaryMax?: number;

  @ApiPropertyOptional({ description: 'What the candidate intends to ask for' })
  @IsInt()
  @IsOptional()
  targetAsk?: number;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  sourceUrl?: string;
}
