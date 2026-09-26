import Link from 'next/link'
import AppointmentListRow from '@/features/appointments/components/AppointmentListRow'
import styles from './UpcomingList.module.css'

type Appointment = {
  id: string
  dateTime: Date
  duration: number
  notes: string | null
  patient: {
    id: string
    firstName: string
    lastName: string
    phone: string
  }
}

type UpcomingListProps = {
  appointments: Appointment[]
}

export default function UpcomingList({ appointments }: UpcomingListProps) {
  if (appointments.length === 0) {
    return (
      <div className={styles.empty}>
        No upcoming appointments this week.
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Upcoming appointments</h2>
        <Link href="/appointments" className={styles.viewAll}>
          View all →
        </Link>
      </div>

      <div className={styles.list}>
        {appointments.map((appt) => (
          <AppointmentListRow key={appt.id} appointment={appt} />
        ))}
      </div>
    </div>
  )
}