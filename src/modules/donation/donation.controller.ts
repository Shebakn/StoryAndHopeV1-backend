import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  UseGuards,
  Param,
  Patch,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';

import { DonationService } from './donation.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { FilterDonationsDto } from './dto/filter-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('donations')
export class DonationController {
  constructor(private readonly donationService: DonationService) {}

  // ==============================
  // 1️⃣ إنشاء تبرع (مستخدم مسجل)
  // ==============================
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateDonationDto, @Req() req) {
    // userId لا يأتي من العميل
    return this.donationService.create(dto, req.user.id);
  }

  // ==============================
  // 2️⃣ عرض تبرعاتي (للمستخدم الحالي فقط)
  // ==============================
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMyDonations(@Query() filter: FilterDonationsDto, @Req() req) {
    return this.donationService.findAll({
      ...filter,
      userId: req.user.id, // نفرض ملكية البيانات
    });
  }

  // ==============================
  // 3️⃣ عرض جميع التبرعات (Admin فقط)
  // ==============================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin')
  async findAll(@Query() filter: FilterDonationsDto) {
    return this.donationService.findAll(filter);
  }

  // ==============================
  // 4️⃣ تحديث الحالة (Admin فقط)
  // ==============================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateDonationDto) {
    return this.donationService.updateStatus(id, dto);
  }

  // ==============================
  // 5️⃣ Webhook من بوابة الدفع
  // ==============================
  @Post('webhook')
  async handleWebhook(
    @Body() dto: PaymentWebhookDto,
    @Headers('x-signature') signature: string,
    @Req() req,
  ) {
    const isValid = this.donationService.verifyWebhookSignature(
      Buffer.from(JSON.stringify(req.body)),
      signature,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return this.donationService.processWebhook(dto);
  }
}
