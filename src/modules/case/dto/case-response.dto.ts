// src/modules/case/dto/case-response.dto.ts
import { Case, CaseMedia, CaseCategory, Category } from '@prisma/client';

export class CaseMediaResponseDto {
  id: string;
  url: string;
  publicId: string;
  type: string;
  format?: string;
  bytes?: number;
  order: number;
  createdAt: Date;

  static fromEntity(media: CaseMedia): CaseMediaResponseDto {
    return {
      id: media.id,
      url: media.url,
      publicId: media.publicId,
      type: media.type,
      format: media.format || undefined,
      bytes: media.bytes || undefined,
      order: media.order,
      createdAt: media.createdAt,
    };
  }
}

export class CategoryResponseDto {
  id: string;
  name: string;

  static fromEntity(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
    };
  }
}

export class CaseResponseDto {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  goals: string[];
  goalAmount: number;
  raisedAmount: number;
  location: string;
  priority: string;
  isUrgent: boolean;
  isFeatured: boolean;
  status: string;
  beneficiaryName?: string;
  beneficiaryAge?: number;
  beneficiaryStory?: string;
  organizationId: string;
  caseTypeId: string;
  coverMedia?: CaseMediaResponseDto;
  media: CaseMediaResponseDto[];
  categories: CategoryResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(
    caseData: Case & {
      media?: CaseMedia[];
      coverMedia?: CaseMedia | null;
      caseCategories?: (CaseCategory & { category: Category })[];
    },
  ): CaseResponseDto {
    const dto = new CaseResponseDto();
    dto.id = caseData.id;
    dto.title = caseData.title;
    dto.shortDescription = caseData.shortDescription;
    dto.fullDescription = caseData.fullDescription;
    dto.goals = caseData.goals || [];
    dto.goalAmount = caseData.goalAmount.toNumber();
    dto.raisedAmount = caseData.raisedAmount.toNumber();
    dto.location = caseData.location;
    dto.priority = caseData.priority;
    dto.isUrgent = caseData.isUrgent;
    dto.isFeatured = caseData.isFeatured;
    dto.status = caseData.status;
    dto.beneficiaryName = caseData.beneficiaryName || undefined;
    dto.beneficiaryAge = caseData.beneficiaryAge || undefined;
    dto.beneficiaryStory = caseData.beneficiaryStory || undefined;
    dto.organizationId = caseData.organizationId;
    dto.caseTypeId = caseData.caseTypeId;
    dto.createdAt = caseData.createdAt;
    dto.updatedAt = caseData.updatedAt;

    // ✅ تحسين: إذا كان هناك coverMedia، استخدمه
    if (caseData.coverMedia) {
      dto.coverMedia = CaseMediaResponseDto.fromEntity(caseData.coverMedia);
    }
    // ✅ إذا لم يكن هناك coverMedia ولكن هناك media، استخدم أول media
    else if (caseData.media && caseData.media.length > 0) {
      const firstMedia = caseData.media.sort((a, b) => a.order - b.order)[0];
      dto.coverMedia = CaseMediaResponseDto.fromEntity(firstMedia);
    }

    // ✅ جلب جميع الميديا (ما عدا الـ cover إذا كان موجوداً في القائمة)
    if (caseData.media) {
      dto.media = caseData.media
        .filter((m) => m.id !== caseData.coverMediaId) // استثني الـ cover من القائمة العادية
        .map((m) => CaseMediaResponseDto.fromEntity(m))
        .sort((a, b) => a.order - b.order);
    } else {
      dto.media = [];
    }

    if (caseData.caseCategories) {
      dto.categories = caseData.caseCategories.map((cc) =>
        CategoryResponseDto.fromEntity(cc.category),
      );
    } else {
      dto.categories = [];
    }

    return dto;
  }
}

export class CaseListResponseDto {
  data: CaseResponseDto[];
  total: number;
  page: number;
  limit: number;
}
