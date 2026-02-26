import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  create(@Body() dto: CreatePaymentMethodDto) {
    return this.paymentMethodService.create(dto);
  }

  @Get()
  findAll() {
    return this.paymentMethodService.findAll();
  }

  @Get('organization/:organizationId')
  findByOrganization(@Param('organizationId') organizationId: string) {
    return this.paymentMethodService.findByOrganization(organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentMethodService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePaymentMethodDto) {
    return this.paymentMethodService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentMethodService.remove(id);
  }
}
