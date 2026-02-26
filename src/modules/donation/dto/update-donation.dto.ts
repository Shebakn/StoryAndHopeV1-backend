import { PartialType } from '@nestjs/mapped-types';
import { CreateDonationDto } from './create-donation.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DonationStatus } from '@prisma/client';

export class UpdateDonationDto extends PartialType(CreateDonationDto) {
  @IsEnum(DonationStatus)
  status: DonationStatus;

  @IsOptional()
  @IsString()
  transactionRef?: string;
}
