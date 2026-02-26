import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module'; // لإتاحة JwtStrategy و AuthGuard

@Module({
  imports: [AuthModule], // مهم لجعل JwtStrategy والـ guard متاحين
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService], // لتصدير الـ Service لأي Module آخر (مثل Auth)
})
export class UserModule {}
