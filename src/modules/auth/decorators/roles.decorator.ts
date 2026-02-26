import { SetMetadata } from '@nestjs/common';

/**
 * Decorator لتحديد أدوار المستخدم المطلوبة للوصول إلى هذا الـ route.
 * مثال:
 * @Roles('ADMIN')  → يسمح فقط للمستخدمين ذوي الدور ADMIN
 * @Roles('ADMIN', 'MODERATOR') → يسمح لأي دور من الأدوار المحددة
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
