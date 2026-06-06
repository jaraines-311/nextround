import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @ApiProperty()
  @IsString()
  answer: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  durationSeconds?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  audioUrl?: string;
}
