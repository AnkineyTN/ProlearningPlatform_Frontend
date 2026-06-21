import { z } from 'zod';

export const languages = ['VI', 'EN'] as const;
export const educations = [
  'HIGH_SCHOOL',
  'COLLEGE',
  'UNIVERSITY',
  'OTHER',
] as const;
export const hearAppFromOptions = [
  'YOUTUBE',
  'FACEBOOK',
  'TIKTOK',
  'FRIEND',
  'OTHER',
] as const;

export const profileSchema = z.object({
  firstName: z.string().min(1, 'Vui lòng nhập tên').max(50, 'Tối đa 50 ký tự'),
  lastName: z.string().min(1, 'Vui lòng nhập họ').max(50, 'Tối đa 50 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  language: z.string().min(1, 'Vui lòng chọn ngôn ngữ'),
  education: z.string().min(1, 'Vui lòng chọn học vấn'),
  hearAppFrom: z.string().min(1, 'Vui lòng chọn nguồn biết đến'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const profileTabs = [
  'profile',
  'preferences',
  'ai',
  'security',
  'billing',
] as const;
export type ProfileTab = (typeof profileTabs)[number];

export function isProfileTab(v: string | null): v is ProfileTab {
  return profileTabs.includes(v as ProfileTab);
}

export const inputCls =
  'w-full rounded-[8px] text-sm outline-none transition-colors bg-[var(--pl-bg)] border border-[var(--pl-border)] text-[var(--pl-text)] focus:border-[var(--pl-accent)] px-3.5 py-[11px]';
