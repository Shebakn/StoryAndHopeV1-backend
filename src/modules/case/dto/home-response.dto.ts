// src/modules/case/dto/home-response.dto.ts
import { CaseResponseDto } from './case-response.dto';

export class HomeStatsDto {
  totalCases: number;
  totalDonations: number;
  totalBeneficiaries: number;
}
export class HomeResponseDto {
  topStories: CaseResponseDto[]; // أعلى 4 قصص حسب المبلغ المجموع
  topAppeals: CaseResponseDto[]; // أعلى 4 مناشدات حسب المبلغ المجموع
  recentStories: CaseResponseDto[]; // آخر 4 قصص مكتملة
  recentAppeals: CaseResponseDto[]; // آخر 4 مناشدات مكتملة
  stats: HomeStatsDto;
}
