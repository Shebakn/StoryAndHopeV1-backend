// src/modules/case-media/dto/create-case-media.dto.ts
import {
  IsUUID,
  IsEnum,
  IsUrl,
  IsString,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { MediaType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateCaseMediaDto {
  @IsUUID()
  caseId: string;

  @IsEnum(MediaType)
  type: MediaType;

  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  publicId?: string;

  @IsString()
  @IsOptional()
  format?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  bytes?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  order?: number;
}
