// في ملف home.dto.ts
export class HomeResponseDto {
  topStories: CaseResponseDto[];
  topAppeals: CaseResponseDto[];
  recentStories: CaseResponseDto[];    // قصص مكتملة
  recentAppeals: CaseResponseDto[];    // مناشدات مكتملة
  stats: {
    totalCases: number;
    totalDonations: number;
    totalBeneficiaries: number;
  };
}