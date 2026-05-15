import type { AxiosResponse } from 'axios';
import api from '../client';
import type {
  OnboardingAnalytics,
  OnboardingApiEnvelope,
} from '../types/onboarding.types';

export const onboardingAPI = {
  getAdminAnalytics: (): Promise<
    AxiosResponse<OnboardingApiEnvelope<OnboardingAnalytics>>
  > => api.get('/admin/onboarding/analytics'),
};
