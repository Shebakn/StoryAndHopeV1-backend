// src/modules/case-media/dto/case-media-response.dto.ts
import { MediaType } from '@prisma/client';

export class CaseMediaResponseDto {
  id: string;
  caseId: string;
  publicId: string;
  url: string;
  type: MediaType;
  format?: string;
  bytes?: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;

  // معلومات إضافية
  uploadedBy?: {
    id: string;
    name: string;
    email: string;
  };

  // مؤشر إذا كان هذا الملف هو الغلاف
  isCover?: boolean;

  static fromEntity(media: any, coverMediaId?: string): CaseMediaResponseDto {
    return {
      id: media.id,
      caseId: media.caseId,
      publicId: media.publicId,
      url: media.url,
      type: media.type,
      format: media.format,
      bytes: media.bytes,
      order: media.order,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
      uploadedBy: media.uploadedBy
        ? {
            id: media.uploadedBy.id,
            name: media.uploadedBy.name,
            email: media.uploadedBy.email,
          }
        : undefined,
      isCover: coverMediaId === media.id,
    };
  }
}
