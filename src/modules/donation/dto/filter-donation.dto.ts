import { IsOptional, IsUUID, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DonationStatus } from '@prisma/client';

export class FilterDonationsDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsEnum(DonationStatus)
  status?: DonationStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
