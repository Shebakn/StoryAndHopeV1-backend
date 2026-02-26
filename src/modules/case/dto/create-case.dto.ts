import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CasePriority, CaseStatus } from '@prisma/client';

export class CreateCaseDto {
  @IsString()
  title: string;

  @IsString()
  shortDescription: string;

  @IsString()
  fullDescription: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  goals?: string[];

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  goalAmount: number;

  @IsString()
  location: string;

  @IsEnum(CasePriority)
  priority: CasePriority;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isUrgent?: boolean;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isFeatured?: boolean;

  @IsEnum(CaseStatus)
  @IsOptional()
  status?: CaseStatus;

  @IsString()
  @IsOptional()
  beneficiaryName?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(120)
  @Type(() => Number)
  beneficiaryAge?: number;

  @IsString()
  @IsOptional()
  beneficiaryStory?: string;

  @IsUUID()
  organizationId: string;

  @IsUUID()
  caseTypeId: string;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  categoryIds?: string[];
}
