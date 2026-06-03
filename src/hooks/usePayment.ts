import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentAPI } from '@/services/endpoints/payment';

export function useCreatePayment() {
  return useMutation({
    mutationFn: () =>
      paymentAPI
        .createPayment({ platform: 'web' })
        .then((res) => res.data.data),
  });
}

export function useCancelPayment() {
  return useMutation({
    mutationFn: (orderCode: number) => paymentAPI.cancelPayment(orderCode),
  });
}

type PollOptions = {
  orderCode: number | null;
  enabled: boolean;
  pollCount: number;
};

export function useGetPaymentStatus({ orderCode, enabled, pollCount }: PollOptions) {
  return useQuery({
    queryKey: ['payment', 'status', orderCode],
    queryFn: async () => {
      const res = await paymentAPI.getPaymentStatus(orderCode!);
      return res.data.data;
    },
    enabled: enabled && !!orderCode,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'PAID' || status === 'CANCELLED' || status === 'EXPIRED') return false;
      if (pollCount >= 10) return false;
      return 2000;
    },
    gcTime: 0,
  });
}
