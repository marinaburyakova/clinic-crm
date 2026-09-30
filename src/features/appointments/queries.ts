import 'server-only'
import { prisma } from '@/lib/db'
import {
  getMonthGrid,
  getTodayRange,
  getWeekRange,
} from '@/lib/date-utils'
import {
  APPOINTMENT_PATIENT_SELECT,
  countDoctorAppointmentsInRange,
  getNextDoctorAppointment,
} from '@/features/appointments/utils'

/**
 * Приёмы врача( appointments) за конкретный день.
 * `dayKey` в формате `YYYY-MM-DD`, интерпретируется в Europe/Moscow.
 */
export async function getDayAppointmentsForDoctor(
  doctorId: string,
  dayKey: string
) {
  const dayStart = new Date(`${dayKey}T00:00:00+03:00`)
  const dayEnd = new Date(`${dayKey}T23:59:59.999+03:00`)

  return prisma.appointment.findMany({
    where: {
      doctorId,
      dateTime: { gte: dayStart, lte: dayEnd },
    },
    orderBy: { dateTime: 'asc' },
    include: {
      patient: {
        select: APPOINTMENT_PATIENT_SELECT,
      },
    },
  })
}

/**
 * Статистика врача на reference-дату:
 * - приёмов сегодня
 * - приёмов на текущей неделе
 * - приёмов в текущем месяце
 * - ближайший будущий приём
 */
export async function getDoctorAppointmentStats(
  doctorId: string,
  referenceDate: Date
) {
  const today = getTodayRange()
  const week = getWeekRange(referenceDate)
  const month = getMonthGrid(referenceDate)

  const [todayCount, weekCount, monthCount, next] = await Promise.all([
    countDoctorAppointmentsInRange(doctorId, today),
    countDoctorAppointmentsInRange(doctorId, week),
    countDoctorAppointmentsInRange(doctorId, {
      start: month.monthStart,
      end: month.monthEnd,
    }),
    getNextDoctorAppointment(doctorId),
  ])

  return { todayCount, weekCount, monthCount, next }
}