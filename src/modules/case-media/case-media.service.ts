// src/modules/case-media/case-media.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCaseMediaDto } from './dto/create-case-media.dto';

@Injectable()
export class CaseMediaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCaseMediaDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1️⃣ تأكد أن الحالة موجودة
      const caseExists = await tx.case.findUnique({
        where: { id: dto.caseId },
        include: { media: true },
      });

      if (!caseExists) {
        throw new NotFoundException('Case not found');
      }

      // 2️⃣ تحديد الترتيب التالي
      const nextOrder = dto.order ?? caseExists.media.length;

      // 3️⃣ إنشاء الوسيط
      const media = await tx.caseMedia.create({
        data: {
          caseId: dto.caseId,
          type: dto.type,
          url: dto.url,
          publicId: dto.publicId,
          format: dto.format,
          bytes: dto.bytes,
          order: nextOrder,
        },
      });

      // 4️⃣ إذا لا يوجد cover → اجعل أول عنصر هو cover
      if (!caseExists.coverMediaId) {
        await tx.case.update({
          where: { id: dto.caseId },
          data: { coverMediaId: media.id },
        });
      }

      return media;
    });
  }

  async findByCase(caseId: string) {
    const caseExists = await this.prisma.case.findUnique({
      where: { id: caseId },
      select: { coverMediaId: true },
    });

    if (!caseExists) {
      throw new NotFoundException('Case not found');
    }

    const media = await this.prisma.caseMedia.findMany({
      where: { caseId },
      orderBy: { order: 'asc' },
    });

    // إضافة حقل isCover لكل عنصر
    return media.map((item) => ({
      ...item,
      isCover: item.id === caseExists.coverMediaId,
    }));
  }

  async findOne(id: string) {
    const media = await this.prisma.caseMedia.findUnique({
      where: { id },
    });

    if (!media) return null;

    const caseData = await this.prisma.case.findUnique({
      where: { id: media.caseId },
      select: { coverMediaId: true },
    });

    return {
      ...media,
      isCover: media.id === caseData?.coverMediaId,
    };
  }

  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const media = await tx.caseMedia.findUnique({
        where: { id },
      });

      if (!media) {
        throw new NotFoundException('Media not found');
      }

      const caseData = await tx.case.findUnique({
        where: { id: media.caseId },
      });

      // حذف الوسيط
      await tx.caseMedia.delete({
        where: { id },
      });

      // إذا كان هو cover → اختر بديل
      if (caseData?.coverMediaId === id) {
        const nextMedia = await tx.caseMedia.findFirst({
          where: { caseId: media.caseId },
          orderBy: { order: 'asc' },
        });

        await tx.case.update({
          where: { id: media.caseId },
          data: {
            coverMediaId: nextMedia?.id ?? null,
          },
        });
      }

      return { message: 'Deleted successfully' };
    });
  }

  async reorder(items: { id: string; order: number }[]) {
    if (!items.length) {
      return { message: 'Nothing to reorder' };
    }

    return this.prisma.$transaction(async (tx) => {
      // تأكد أن جميع العناصر موجودة
      const mediaIds = items.map((i) => i.id);

      const existingMedia = await tx.caseMedia.findMany({
        where: { id: { in: mediaIds } },
      });

      if (existingMedia.length !== items.length) {
        throw new NotFoundException('One or more media items not found');
      }

      // تأكد أنهم ينتمون لنفس الحالة
      const caseId = existingMedia[0].caseId;

      const allSameCase = existingMedia.every((m) => m.caseId === caseId);

      if (!allSameCase) {
        throw new BadRequestException('All media must belong to the same case');
      }

      // تحديث الترتيب
      for (const item of items) {
        await tx.caseMedia.update({
          where: { id: item.id },
          data: { order: item.order },
        });
      }

      return { message: 'Reordered successfully' };
    });
  }

  async setCover(id: string) {
    const media = await this.prisma.caseMedia.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    await this.prisma.case.update({
      where: { id: media.caseId },
      data: { coverMediaId: id },
    });

    return this.findOne(id);
  }
}
