import Link from 'next/link'
import {
  formatMonth,
  formatToday,
  getMonthUrl,
  shiftMonth,
  getDayKey,
} from '@/lib/date-utils'
import styles from './MonthNavigator.module.css'

type MonthNavigatorProps = {
  monthDate: Date
  basePath: string
}

export default function MonthNavigator({
  monthDate,
  basePath,
}: MonthNavigatorProps) {
  const prevMonth = shiftMonth(monthDate, -1)
  const nextMonth = shiftMonth(monthDate, +1)

  const currentMonthKey = getDayKey(new Date()).slice(0, 7) // 'YYYY-MM'
  const monthKey = getDayKey(monthDate).slice(0, 7)
  const isCurrentMonth = monthKey === currentMonthKey

  return (
    <div className={styles.nav}>
      <Link
        href={getMonthUrl(basePath, prevMonth)}
        className={styles.button}
      >
        ←
      </Link>

      <div className={styles.title}>{formatMonth(monthDate)}</div>
      <div className={styles.subtitle}>{formatToday()}</div>

      <Link
        href={getMonthUrl(basePath, nextMonth)}
        className={styles.button}
      >
        →
      </Link>

      {!isCurrentMonth && (
        <Link
          href={basePath}
          className={styles.today}
        >
          Today
        </Link>
      )}
    </div>
  )
}
