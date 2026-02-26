import { UserRole } from '@prisma/client';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}
