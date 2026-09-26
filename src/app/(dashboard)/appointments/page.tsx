import { getCurrentUser } from '@/lib/auth'
import {
  getDayAppointmentsForDoctor,
  getDoctorAppointmentStats,
} from '@/features/appointments/queries'
import {
  getDayKey,
  getDayLabel,
  getMonthGrid,
  parseMonthParam,
} from '@/lib/date-utils'
import AppointmentsList from '@/features/appointments/components/AppointmentsList'
import MonthCalendar from '@/features/appointments/components/MonthCalendar'
import MonthNavigator from '@/features/appointments/components/MonthNavigator'
import PageHeader from '@/components/layout/PageHeader'
import styles from './appointments.module.css'

type Props = {
  searchParams: Promise<{ month?: string; date?: string }>
}

export default async function AppointmentsPage({ searchParams }: Props) {
  const user = await getCurrentUser()

  const params = await searchParams
  const monthDate = parseMonthParam(params.month)
  const { days, monthStart } = getMonthGrid(monthDate)

  const currentMonthKey = getDayKey(monthStart).slice(0, 7)
  const todayKey = getDayKey(new Date())
  const selectedDateKey = params.date ?? todayKey

  const [dayAppointments, stats] = await Promise.all([
    getDayAppointmentsForDoctor(user!.id, selectedDateKey),
    getDoctorAppointmentStats(user!.id, monthDate),
  ])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <PageHeader title="Appointments" subtitle="Your schedule" />
        <div className={styles.statsInline}>
          <StatChip label="Today" value={stats.todayCount} />
          <StatChip label="Week" value={stats.weekCount} />
          <StatChip label="Month" value={stats.monthCount} />
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.calendarColumn}>
          <MonthNavigator monthDate={monthDate} basePath="/appointments" />
          <MonthCalendar
            days={days}
            selectedDateKey={selectedDateKey}
            todayKey={todayKey}
            currentMonthKey={currentMonthKey}
            monthKey={currentMonthKey}
          />
        </div>

        <div className={styles.dayColumn}>
          <h2 className={styles.dayTitle}>
            {getDayLabel(selectedDateKey)}
            <span className={styles.dayCount}>{dayAppointments.length}</span>
          </h2>
          <AppointmentsList appointments={dayAppointments} />
        </div>
      </div>
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.statChip}>
      <div className={styles.statChipLabel}>{label}</div>
      <div className={styles.statChipValue}>{value}</div>
    </div>
  )
}