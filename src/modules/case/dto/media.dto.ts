/* eslint-disable prettier/prettier */
// src/modules/case/dto/media.dto.ts
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MediaType } from '@prisma/client';

// =====================================================
// Media DTOs
// =====================================================

export class MediaDto {
  @IsEnum(MediaType)
  type: MediaType;

  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  publicId?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  order?: number;
}

export class UploadMediaDto {
  @IsOptional()
  @Transform(({ value }) => (value ? String(value).toUpperCase() : undefined))
  @IsEnum(MediaType, {
    message: 'type must be one of the following values: IMAGE, VIDEO',
  })
  type?: MediaType;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  @IsOptional()
  isCover?: boolean;
}

export class UploadMultipleMediaDto {
  @IsArray()
  @IsOptional()
  mediaData?: UploadMediaDto[];
}