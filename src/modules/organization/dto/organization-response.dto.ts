export class OrganizationResponseDto {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: Date;
}
