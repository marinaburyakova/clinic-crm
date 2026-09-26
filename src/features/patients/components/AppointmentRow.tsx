import styles from './AppointmentRow.module.css'

type AppointmentRowProps = {
  appointment: {
    id: string
    dateTime: Date
    duration: number
    notes: string | null
    doctor: { id: string; name: string }
  }
}

export default function AppointmentRow({ appointment }: AppointmentRowProps) {
  const date = new Date(appointment.dateTime)
  const dateStr = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Moscow',
  })
  const timeStr = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  })

  return (
    <div className={styles.row}>
      <div className={styles.date}>
        <div className={styles.dateDay}>{dateStr}</div>
        <div className={styles.dateTime}>{timeStr}</div>
      </div>

      <div className={styles.info}>
        <div className={styles.doctor}>Dr. {appointment.doctor.name}</div>
        {appointment.notes && (
          <div className={styles.notes}>{appointment.notes}</div>
        )}
      </div>

      <div className={styles.duration}>{appointment.duration} min</div>
    </div>
  )
}
