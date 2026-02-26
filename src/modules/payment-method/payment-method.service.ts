import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentMethodDto) {
    const org = await this.prisma.organization.findUnique({
      where: { id: dto.organizationId },
    });

    if (!org) throw new NotFoundException('Organization not found');

    return this.prisma.paymentMethod.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.paymentMethod.findMany({
      include: { organization: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByOrganization(organizationId: string) {
    return this.prisma.paymentMethod.findMany({
      where: { organizationId, isActive: true },
    });
  }

  async findOne(id: string) {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!method) throw new NotFoundException('Payment method not found');

    return method;
  }

  async update(id: string, dto: UpdatePaymentMethodDto) {
    return this.prisma.paymentMethod.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.paymentMethod.delete({
      where: { id },
    });
  }
}
