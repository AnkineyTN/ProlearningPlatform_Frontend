import { z } from 'zod';
import { type TFunction } from 'i18next';

export const signupSchema = (t: TFunction) =>
  z
    .object({
      firstName: z
        .string()
        .trim()
        .min(2, t('signup.firstNameMin'))
        .max(20, t('signup.firstNameMax')),
      lastName: z
        .string()
        .trim()
        .min(2, t('signup.lastNameMin'))
        .max(20, t('signup.lastNameMax')),
      email: z
        .string()
        .trim()
        .min(1, t('signup.emailRequired'))
        .max(254, t('signup.emailMax'))
        .email(t('signup.invalidEmail')),
      password: z
        .string()
        .min(8, t('signup.passwordMin'))
        .max(20, t('signup.passwordMax')),
      confirmPassword: z.string().min(1, t('signup.confirmPasswordPlease')),
      role: z.enum(['ROLE_USER', 'ROLE_ADMIN', 'ROLE_TEACHER']),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('signup.passwordNotMatch'),
      path: ['confirmPassword'],
    });

export const loginSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .trim()
      .min(1, t('signin.emailRequired'))
      .max(254, t('signup.emailMax'))
      .email(t('signin.invalidEmail')),
    password: z
      .string()
      .min(8, t('signup.passwordMin'))
      .max(20, t('signup.passwordMax')),
  });

export type SignupFormData = z.infer<ReturnType<typeof signupSchema>>;
export type LoginFormData = z.infer<ReturnType<typeof loginSchema>>;
