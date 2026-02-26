// src/modules/case-media/dto/update-case-media.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCaseMediaDto } from './create-case-media.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCaseMediaDto extends PartialType(CreateCaseMediaDto) {
  @IsBoolean()
  @IsOptional()
  isCover?: boolean;
}
