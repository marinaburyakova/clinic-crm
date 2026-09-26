'use client'

import Link from 'next/link'
import { formatTime } from '@/lib/date-utils'
import styles from './AppointmentListRow.module.css'

type AppointmentListRowProps = {
  appointment: {
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
  onDelete?: (id: string) => void   // ← опциональный
}

export default function AppointmentListRow({
  appointment,
  onDelete,
}: AppointmentListRowProps) {
  const time = formatTime(appointment.dateTime)   // ← без new Date

  return (
    <div className={styles.rowWrapper}>
      <Link href={`/patients/${appointment.patient.id}`} className={styles.row}>
        <div className={styles.time}>{time}</div>
        <div className={styles.info}>
          <div className={styles.patient}>
            {appointment.patient.lastName} {appointment.patient.firstName}
          </div>
          <div className={styles.meta}>
            {appointment.patient.phone}
            {appointment.notes && ` · ${appointment.notes}`}
          </div>
        </div>
        <div className={styles.duration}>{appointment.duration} min</div>
        <div className={styles.arrow}>→</div>
      </Link>

      {onDelete && (
        <button
          type="button"
          className={styles.deleteButton}
          onClick={() => onDelete(appointment.id)}   // ← без e, без preventDefault
          aria-label={`Удалить приём: ${appointment.patient.lastName} ${appointment.patient.firstName}`}
        >
          ×
        </button>
      )}
    </div>
  )
}