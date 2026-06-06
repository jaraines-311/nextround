import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResumeDto {
  @ApiPropertyOptional({ default: 'My Resume' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  rawText: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fileMimeType?: string;
}
