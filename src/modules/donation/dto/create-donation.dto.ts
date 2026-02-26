import { IsUUID, IsOptional, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateDonationDto {
  @IsUUID()
  caseId: string;

  @IsUUID()
  organizationId: string;

  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(1)
  amount: number;
}
