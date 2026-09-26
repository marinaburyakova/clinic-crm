import styles from './StatsRow.module.css'

type StatsRowProps = {
  todayCount: number
  weekCount: number
  patientsCount: number
}

export default function StatsRow({
  todayCount,
  weekCount,
  patientsCount,
}: StatsRowProps) {
  return (
    <div className={styles.row}>
      <StatCard label="Today" value={todayCount} />
      <StatCard label="This week" value={weekCount} />
      <StatCard label="Patients" value={patientsCount} />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </div>
  )
}