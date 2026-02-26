// case-type.module.ts

import { Module } from '@nestjs/common';
import { CaseTypeService } from './caseType.service';
import { CaseTypeController } from './caseType.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CaseTypeController],
  providers: [CaseTypeService, PrismaService],
  exports: [CaseTypeService], // لو حبيت تستخدمه في مودولات ثانية
})
export class CaseTypeModule {}
