import { Module } from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { PaymentMethodController } from './payment-method.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PaymentMethodController],
  providers: [PaymentMethodService, PrismaService],
})
export class PaymentMethodModule {}
