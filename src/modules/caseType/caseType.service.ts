import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCaseTypeDto } from './dto/create-caseType.dto';
import { UpdateCaseTypeDto } from './dto/update-caseType.dto';
import { CaseTypeResponseDto } from './dto/caseType-response.dto';

@Injectable()
export class CaseTypeService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCaseTypeDto): Promise<CaseTypeResponseDto> {
    const caseType = await this.prisma.caseType.create({ data });
    return this.toResponseDto(caseType);
  }

  async findAll(): Promise<CaseTypeResponseDto[]> {
    const caseTypes = await this.prisma.caseType.findMany();
    return caseTypes.map((ct) => this.toResponseDto(ct));
  }

  async findOne(id: string): Promise<CaseTypeResponseDto> {
    const caseType = await this.prisma.caseType.findUnique({ where: { id } });
    if (!caseType)
      throw new NotFoundException(`CaseType with id ${id} not found`);
    return this.toResponseDto(caseType);
  }

  async update(
    id: string,
    data: UpdateCaseTypeDto,
  ): Promise<CaseTypeResponseDto> {
    try {
      const updated = await this.prisma.caseType.update({
        where: { id },
        data,
      });
      return this.toResponseDto(updated);
    } catch {
      throw new NotFoundException(`CaseType with id ${id} not found`);
    }
  }

  async remove(id: string): Promise<CaseTypeResponseDto> {
    try {
      const deleted = await this.prisma.caseType.delete({ where: { id } });
      return this.toResponseDto(deleted);
    } catch {
      throw new NotFoundException(`CaseType with id ${id} not found`);
    }
  }

  private toResponseDto(caseType: any): CaseTypeResponseDto {
    return {
      id: caseType.id,
      name: caseType.name,
    };
  }
}
