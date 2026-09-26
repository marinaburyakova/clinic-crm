import Link from 'next/link'
import { getDayKey } from '@/lib/date-utils'
import styles from './MonthCalendar.module.css'

type MonthCalendarProps = {
  days: Date[]
  selectedDateKey: string
  todayKey: string
  currentMonthKey: string
  monthKey: string
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MonthCalendar({
  days,
  selectedDateKey,
  todayKey,
  currentMonthKey,
  monthKey,
}: MonthCalendarProps) {
  return (
    <div className={styles.calendar}>
      <div className={styles.weekdays}>
        {WEEKDAYS.map((day) => (
          <div key={day} className={styles.weekday}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {days.map((day) => {
          const dayKey = getDayKey(day)
          const isCurrentMonth = dayKey.slice(0, 7) === currentMonthKey
          const isSelected = dayKey === selectedDateKey
          const isToday = dayKey === todayKey
          const dayNumber = Number(dayKey.slice(8, 10))

          return (
            <Link
              key={dayKey}
              href={`/appointments?month=${monthKey}&date=${dayKey}`}
              className={[
                styles.day,
                !isCurrentMonth && styles.dayOutside,
                isToday && styles.dayToday,
                isSelected && styles.daySelected,
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={isToday ? 'date' : undefined}
            >
              <span className={styles.dayNumber}>{dayNumber}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}