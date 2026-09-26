import { z } from 'zod'

// ─────────────────────────────────────────
// Auth
// ─────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

// ─────────────────────────────────────────
// Appointments
// ─────────────────────────────────────────

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  dateTime: z.coerce.date().refine((d) => d > new Date(), {
    message: 'Date and time must be in the future',
  }),
  duration: z.coerce
    .number()
    .int('Duration must be a whole number')
    .min(5, 'Duration must be at least 5 minutes')
    .max(240, 'Duration must be at most 4 hours'),
  notes: z
    .string()
    .max(1000, 'Notes must be at most 1000 characters')
    .optional()
    .or(z.literal('')),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>