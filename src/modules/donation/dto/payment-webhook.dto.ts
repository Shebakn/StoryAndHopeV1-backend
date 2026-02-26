import { IsString, IsNumber } from 'class-validator';

export class PaymentWebhookDto {
  @IsString()
  transactionRef: string;

  @IsNumber()
  amount: number;

  @IsString()
  status: string;
}
