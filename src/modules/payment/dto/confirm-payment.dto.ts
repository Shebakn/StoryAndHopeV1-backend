import { IsString, IsInt, IsPositive } from 'class-validator';

export class ConfirmPaymentDto {
  @IsString()
  paymentIntentId: string;

  @IsInt()
  @IsPositive()
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  campaignId: string;

  @IsString()
  donorId: string;
}
