import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCreditPurchaseDto {
  @ApiProperty()
  @IsString()
  priceId: string;

  @ApiProperty({ description: 'Number of credits to purchase' })
  @IsNumber()
  creditAmount: number;

  @ApiProperty()
  @IsString()
  successUrl: string;

  @ApiProperty()
  @IsString()
  cancelUrl: string;
}
