import 'server-only'
import { prisma } from '@/lib/db'
import { getMonthGrid, getTodayRange, getWeekRange } from '@/lib/date-utils'


export async function getDayAppointmentsForDoctor(
  doctorId: string,
  dayKey: string,
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

export async function getDoctorAppointmentStats(
  doctorId: string,
  referenceDate: Date,
) {
  const today = getTodayRange()
  const week = getWeekRange(referenceDate)
  const month = getMonthGrid(referenceDate)

  const [todayCount, weekCount, monthCount, next] = await Promise.all([
    prisma.appointment.count({
      where: {
        doctorId,
        dateTime: { gte: today.start, lte: today.end },
      },
    }),
    prisma.appointment.count({
      where: {
        doctorId,
        dateTime: { gte: week.start, lte: week.end },
      },
    }),
    prisma.appointment.count({
      where: {
        doctorId,
        dateTime: { gte: month.monthStart, lte: month.monthEnd },
      },
    }),
    prisma.appointment.findFirst({
      where: {
        doctorId,
        dateTime: { gte: new Date() },
      },
      orderBy: { dateTime: 'asc' },
      include: {
        patient: {
          select: { firstName: true, lastName: true },
        },
      },
    }),
  ])

  return { todayCount, weekCount, monthCount, next }
}
