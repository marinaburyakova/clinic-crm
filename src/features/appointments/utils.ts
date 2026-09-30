import 'server-only'
import { prisma } from '@/lib/db'

/**
 * Считает количество приёмов врача в интервале [start, end].
 */
export async function countDoctorAppointmentsInRange(
  doctorId: string,
  range: { start: Date; end: Date }
) {
  return prisma.appointment.count({
    where: {
      doctorId,
      dateTime: { gte: range.start, lte: range.end },
    },
  })
}

/**
 * Возвращает ближайший будущий приём врача.
 */
export async function getNextDoctorAppointment(doctorId: string) {
  return prisma.appointment.findFirst({
    where: {
      doctorId,
      dateTime: { gte: new Date() },
    },
    orderBy: { dateTime: 'asc' },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
    },
  })
}

/**
 * Возвращает N ближайших будущих приёмов врача до указанной даты.
 */
export async function getUpcomingDoctorAppointments(
  doctorId: string,
  options: { until?: Date; limit?: number }
) {
  return prisma.appointment.findMany({
    where: {
      doctorId,
      dateTime: {
        gte: new Date(),
        ...(options.until ? { lte: options.until } : {}),
      },
    },
    orderBy: { dateTime: 'asc' },
    take: options.limit ?? 5,
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
    },
  })
}

/**
 * Общий select для patient в контексте appointment —
 * чтобы не дублировать объект в каждом запросе.
 */
export const APPOINTMENT_PATIENT_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
} as const