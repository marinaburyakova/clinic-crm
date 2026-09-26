import { formatFullDate } from '@/lib/date-utils'
import styles from './DateBanner.module.css'

export default function DateBanner() {
  const today = formatFullDate()

  return (
    <div className={styles.banner}>
      <div className={styles.label}>Today</div>
      <div className={styles.date}>{today}</div>
    </div>
  )
}