import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminAdjustDto {
  @ApiProperty({ description: 'Positive to add, negative to deduct' })
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  reason: string;
}
