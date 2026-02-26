/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CaseTypeService } from './caseType.service';
import { CreateCaseTypeDto } from './dto/create-caseType.dto';
import { UpdateCaseTypeDto } from './dto/update-caseType.dto';
import { CaseTypeResponseDto } from './dto/caseType-response.dto';

@Controller('case-types')
export class CaseTypeController {
  constructor(private readonly caseTypeService: CaseTypeService) {}

  @Post()
  create(@Body() dto: CreateCaseTypeDto): Promise<CaseTypeResponseDto> {
    return this.caseTypeService.create(dto);
  }

  @Get()
  findAll(): Promise<CaseTypeResponseDto[]> {
    return this.caseTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CaseTypeResponseDto> {
    return this.caseTypeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCaseTypeDto,
  ): Promise<CaseTypeResponseDto> {
    return this.caseTypeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<CaseTypeResponseDto> {
    return this.caseTypeService.remove(id);
  }
}
