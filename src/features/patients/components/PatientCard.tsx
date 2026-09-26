import Link from 'next/link'
import type { Patient } from '@/prisma/generated/client'
import styles from './PatientCard.module.css'

type PatientCardProps = {
  patient: Patient
}

export default function PatientCard({ patient }: PatientCardProps) {
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`.toUpperCase()

  return (
    <Link href={`/patients/${patient.id}`} className={styles.card}>
      <div className={styles.avatar}>{initials}</div>
      <div className={styles.info}>
        <div className={styles.name}>
          {patient.lastName} {patient.firstName}
        </div>
        <div className={styles.meta}>
          <span>{patient.phone}</span>
          {patient.email && <span>· {patient.email}</span>}
        </div>
      </div>
    </Link>
  )
}