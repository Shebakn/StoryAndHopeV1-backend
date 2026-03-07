import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: dto.amount * 100,
      currency: dto.currency,

      metadata: {
        campaignId: dto.campaignId ?? '',
        donorId: dto.donorId ?? '',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }
}