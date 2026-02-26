import { Module } from '@nestjs/common';
import { CasesController } from './case.controller';
import { CasesService } from './case.service';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [CasesController],
  providers: [CasesService, PrismaService],
  exports: [CasesService],
})
export class CasesModule {}
