import { z } from 'zod'

export const signupSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must not exceed 50 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must not exceed 50 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(20, 'Password must not exceed 20 characters'),
    role: z.enum(['ROLE_USER', 'ROLE_ADMIN', 'ROLE_TEACHER'])
})

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
})

export type SignupFormData = z.infer<typeof signupSchema>
export type LoginFormData = z.infer<typeof loginSchema>
