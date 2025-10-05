import { z } from 'zod'

export const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must not exceed 50 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
})

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
})

export type SignupFormData = z.infer<typeof signupSchema>
export type LoginFormData = z.infer<typeof loginSchema>
