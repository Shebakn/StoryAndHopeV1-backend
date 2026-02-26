import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { FilterDonationsDto } from './dto/filter-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { DonationStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class DonationService {
  constructor(private readonly prisma: PrismaService) {}

  // ==============================
  // 1️⃣ إنشاء تبرع
  // ==============================
  async create(dto: CreateDonationDto, userId: string) {
    return this.prisma.donation.create({
      data: {
        userId,
        caseId: dto.caseId,
        organizationId: dto.organizationId,
        paymentMethodId: dto.paymentMethodId,
        amount: dto.amount,
        status: DonationStatus.PENDING,
      },
    });
  }

  // ==============================
  // 2️⃣ جلب التبرعات مع فلترة
  // ==============================
  async findAll(filter: FilterDonationsDto) {
    const where: any = {};

    if (filter.userId) where.userId = filter.userId;
    if (filter.caseId) where.caseId = filter.caseId;
    if (filter.organizationId) where.organizationId = filter.organizationId;
    if (filter.status) where.status = filter.status;

    return this.prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        case: true,
        user: true,
        paymentMethod: true,
      },
    });
  }

  // ==============================
  // 3️⃣ تحديث الحالة (Admin)
  // ==============================
  async updateStatus(id: string, dto: UpdateDonationDto) {
    const donation = await this.prisma.donation.findUnique({
      where: { id },
    });

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    return this.prisma.donation.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });
  }

  // ==============================
  // 4️⃣ التحقق من Webhook Signature
  // ==============================
  verifyWebhookSignature(rawBody: Buffer, signature: string) {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return expectedSignature === signature;
  }

  // ==============================
  // 5️⃣ معالجة Webhook
  // ==============================
  async processWebhook(dto: PaymentWebhookDto) {
    const donation = await this.prisma.donation.findFirst({
      where: {
        transactionRef: dto.transactionRef,
      },
    });

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    // منع التحديث إذا كانت العملية منتهية
    if (donation.status === DonationStatus.SUCCESS) {
      return { message: 'Already processed' };
    }

    let newStatus: DonationStatus;

    switch (dto.status) {
      case 'SUCCESS':
        newStatus = DonationStatus.SUCCESS;
        break;
      case 'FAILED':
        newStatus = DonationStatus.FAILED;
        break;
      default:
        throw new BadRequestException('Invalid payment status');
    }

    return this.prisma.donation.update({
      where: { id: donation.id },
      data: {
        status: newStatus,
      },
    });
  }
}
