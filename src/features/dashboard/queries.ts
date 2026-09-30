import 'server-only'
import { prisma } from '@/lib/db'
import { getTodayRange, getWeekRange } from '@/lib/date-utils'
import {
  countDoctorAppointmentsInRange,
  getNextDoctorAppointment,
  getUpcomingDoctorAppointments,
} from '@/features/appointments/utils'

export async function getDashboardData(doctorId: string) {
  const today = getTodayRange()
  const week = getWeekRange()

  const [todayCount, weekCount, patientsCount, nextAppointment, upcoming] =
    await Promise.all([
      countDoctorAppointmentsInRange(doctorId, today),
      countDoctorAppointmentsInRange(doctorId, week),
      // Все пациенты клиники — по решению MVP врач видит всех
      prisma.patient.count(),
      getNextDoctorAppointment(doctorId),
      getUpcomingDoctorAppointments(doctorId, { until: week.end, limit: 5 }),
    ])

  return {
    todayCount,
    weekCount,
    patientsCount,
    nextAppointment,
    upcoming,
  }
}