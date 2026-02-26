// src/modules/case-media/case-media.module.ts
import { Module } from '@nestjs/common';
import { CaseMediaController } from './case-media.controller';
import { CaseMediaService } from './case-media.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CaseMediaController],
  providers: [CaseMediaService, PrismaService],
  exports: [CaseMediaService],
})
export class CaseMediaModule {}
