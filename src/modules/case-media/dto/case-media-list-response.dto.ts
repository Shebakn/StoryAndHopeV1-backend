// src/modules/case-media/dto/case-media-list-response.dto.ts
import { CaseMediaResponseDto } from './case-media-response.dto';

export class CaseMediaListResponseDto {
  data: CaseMediaResponseDto[];
  total: number;
  caseId: string;
  coverMediaId?: string;

  // إحصائيات
  stats: {
    images: number;
    videos: number;
    totalSize: number;
  };
}
