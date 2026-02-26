export class PaymentMethodResponseDto {
  id: string;
  organizationId: string;
  name: string;
  provider: string;
  walletAddress?: string;
  isActive: boolean;
  createdAt: Date;
}
