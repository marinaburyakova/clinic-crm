import { getCurrentUser } from '@/lib/auth'
import { getDashboardData } from '@/features/dashboard/queries'
import ProfileCard from '@/features/dashboard/components/ProfileCard'
import DateBanner from '@/features/dashboard/components/DateBanner'
import StatsRow from '@/features/dashboard/components/StatsRow'
import UpcomingList from '@/features/dashboard/components/UpcomingList'
import AppointmentListRow from '@/features/appointments/components/AppointmentListRow'
import styles from './dashboard.module.css'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  const { todayCount, weekCount, patientsCount, nextAppointment, upcoming } =
    await getDashboardData(user!.id)

  const upcomingFiltered = upcoming.filter((a) => a.id !== nextAppointment?.id)

  return (
    <div>
      <ProfileCard
        user={{
          name: user!.name,
          email: user!.email,
          role: user!.role,
          avatarUrl: user!.avatarUrl,
          specialty: user!.specialty,
          bio: user!.bio,
          createdAt: user!.createdAt,
        }}
      />

      <DateBanner />

      <StatsRow
        todayCount={todayCount}
        weekCount={weekCount}
        patientsCount={patientsCount}
      />

      {nextAppointment && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Next appointment</h2>
          <AppointmentListRow appointment={nextAppointment} />
        </section>
      )}

      <section className={styles.section}>
        <UpcomingList appointments={upcomingFiltered} />
      </section>
    </div>
  )
}
