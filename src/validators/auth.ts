import {z} from 'zod'

export const registerSchema = z.object({
    email: z.email('Invalid email'),
    username: z.string().min(5, 'Username should be at least 5 characters long'),
    password: z.string().min(5, 'Password should be at least 5 characters long'),
    lastName: z.string().optional(),
    firstName: z.string().optional()
})

export const loginSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(1, 'Password is required')
})