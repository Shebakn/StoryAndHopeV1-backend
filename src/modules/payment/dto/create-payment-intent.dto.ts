import { IsInt, IsPositive, IsOptional, IsString } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsInt()
  @IsPositive()
  amount: number;

  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  donorId?: string;
}