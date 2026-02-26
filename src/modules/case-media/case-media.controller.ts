/* eslint-disable prettier/prettier */
// src/modules/case-media/case-media.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { CaseMediaService } from './case-media.service';
import { CreateCaseMediaDto } from './dto/create-case-media.dto';

@Controller('case-media')
export class CaseMediaController {
  constructor(private readonly caseMediaService: CaseMediaService) {}

  @Post()
  create(@Body() dto: CreateCaseMediaDto) {
    return this.caseMediaService.create(dto);
  }

  @Get('case/:caseId')
  findByCase(@Param('caseId') caseId: string) {
    return this.caseMediaService.findByCase(caseId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const media = await this.caseMediaService.findOne(id);
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.caseMediaService.remove(id);
  }

  @Patch('reorder')
  reorder(@Body() items: { id: string; order: number }[]) {
    return this.caseMediaService.reorder(items);
  }

  @Patch(':id/set-cover')
  setCover(@Param('id') id: string) {
    return this.caseMediaService.setCover(id);
  }
}