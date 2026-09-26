import 'server-only'
import { prisma } from '@/lib/db'
import { getTodayRange, getWeekRange } from '@/lib/date-utils'

export async function getDashboardData(doctorId: string) {
  const today = getTodayRange()
  const week = getWeekRange()

  const [todayCount, weekCount, patientsCount, nextAppointment, upcoming] =
    await Promise.all([
      // Приёмов сегодня
      prisma.appointment.count({
        where: {
          doctorId,
          dateTime: { gte: today.start, lte: today.end },
        },
      }),

      // Приёмов на этой неделе
      prisma.appointment.count({
        where: {
          doctorId,
          dateTime: { gte: week.start, lte: week.end },
        },
      }),

      // Пациентов всего (не «моих» — всех в клинике, т.к. врач видит всех по решению MVP)
      prisma.patient.count(),

      // Ближайший приём (в будущем)
      prisma.appointment.findFirst({
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
      }),

      // До 5 ближайших приёмов на неделе
      prisma.appointment.findMany({
        where: {
          doctorId,
          dateTime: { gte: new Date(), lte: week.end },
        },
        orderBy: { dateTime: 'asc' },
        take: 5,
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
      }),
    ])

  return {
    todayCount,
    weekCount,
    patientsCount,
    nextAppointment,
    upcoming,
  }
}