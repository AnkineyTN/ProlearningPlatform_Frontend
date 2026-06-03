import api from '@/services/client';
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  GetPaymentStatusResponse,
} from '@/services/types/payment.types';

export const paymentAPI = {
  createPayment: (data: CreatePaymentRequest) =>
    api.post<{ data: CreatePaymentResponse }>('/payment/create', data),

  getPaymentStatus: (orderCode: number) =>
    api.get<{ data: GetPaymentStatusResponse }>(`/payment/status/${orderCode}`),

  cancelPayment: (orderCode: number) =>
    api.post<void>(`/payment/cancel/${orderCode}`),
};
