import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreatePaymentMethodDto {
  @IsUUID()
  organizationId: string;

  @IsString()
  name: string; // مثلا: Payeer USD

  @IsString()
  provider: string; // Payeer / Binance / Bank

  @IsOptional()
  @IsString()
  walletAddress?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
