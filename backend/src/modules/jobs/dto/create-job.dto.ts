import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
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
}
