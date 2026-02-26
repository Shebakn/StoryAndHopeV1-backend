// src/modules/case-media/dto/reorder-case-media.dto.ts
import { IsUUID, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderCaseMediaItemDto {
  @IsUUID()
  id: string;

  @IsInt()
  @Min(0)
  order: number;
}

export class ReorderCaseMediaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderCaseMediaItemDto)
  items: ReorderCaseMediaItemDto[];
}
