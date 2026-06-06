import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutDto {
  @ApiProperty()
  @IsString()
  priceId: string;

  @ApiProperty()
  @IsString()
  successUrl: string;

  @ApiProperty()
  @IsString()
  cancelUrl: string;
}
