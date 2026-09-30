import z from 'zod'
import { FREQUENCY } from '../db/schema.ts'

export const createHabitSchema = z.object({
    name: z.string().min(3),
    description: z.string().min(10).optional(),
    frequency: z.enum(FREQUENCY),
    targetCount: z.number().optional(),
    tagIds: z
    .array(z.uuid())
    .refine((items) => new Set(items).size === items.length, {
      message: "Tag IDs must be unique",
    })
    .optional(),
})

export const updateHabitSchema = z.object({
    name: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    frequency: z.enum(FREQUENCY).optional(),
    targetCount: z.number().optional(),
    tagIds: z
    .array(z.uuid())
    .refine((items) => new Set(items).size === items.length, {
      message: "Tag IDs must be unique",
    })
    .optional(),
})