export type CreatePaymentRequest = { platform: 'web' | 'mobile' };
export type CreatePaymentResponse = { orderCode: number; checkoutUrl: string };
export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';
export type GetPaymentStatusResponse = {
  orderCode: number;
  status: PaymentStatus;
  accountType: 'FREE' | 'PRO';
};
