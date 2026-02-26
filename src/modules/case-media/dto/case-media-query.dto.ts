// src/modules/case-media/dto/case-media-query.dto.ts
import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { MediaType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CaseMediaQueryDto {
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 50;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}
