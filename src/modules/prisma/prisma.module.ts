import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // يجعل PrismaService متاح في كل Modules بدون إعادة الاستيراد
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
