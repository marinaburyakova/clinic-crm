import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPatientById } from '@/features/patients/queries'
import AppointmentRow from '@/features/patients/components/AppointmentRow'
import CreateAppointmentForm from '@/features/appointments/components/CreateAppointmentForm'
import PageHeader from '@/components/layout/PageHeader'
import styles from './patient.module.css'

type Props = {
  params: Promise<{ id: string }>
}

export default async function PatientPage({ params }: Props) {
  const { id } = await params
  const patient = await getPatientById(id)

  if (!patient) {
    notFound()
  }

  const birthDate = patient.dateOfBirth
    ? new Date(patient.dateOfBirth).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'Europe/Moscow',
      })
    : null

  return (
    <div>
      <Link
        href="/patients"
        className={styles.back}
      >
        ← Back to patients
      </Link>

      <PageHeader
        title={`${patient.lastName} ${patient.firstName}`}
        subtitle={patient.phone}
      />

      <div className={styles.info}>
        {patient.email && (
          <InfoRow
            label="Email"
            value={patient.email}
          />
        )}
        {birthDate && (
          <InfoRow
            label="Date of birth"
            value={birthDate}
          />
        )}
        {patient.notes && (
          <InfoRow
            label="Notes"
            value={patient.notes}
          />
        )}
        <InfoRow
          label="Registered"
          value={new Date(patient.createdAt).toLocaleDateString('en-GB', {
            timeZone: 'Europe/Moscow',
          })}
        />
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Appointment history
          <span className={styles.sectionCount}>
            {patient.appointments.length}
          </span>
        </h2>

        {patient.appointments.length === 0 ? (
          <div className={styles.empty}>No appointments yet.</div>
        ) : (
          <div className={styles.appointments}>
            {patient.appointments.map((appointment) => (
              <AppointmentRow
                key={appointment.id}
                appointment={appointment}
              />
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Add appointment</h2>
        <CreateAppointmentForm patientId={patient.id} />
      </section>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.infoRow}>
      <div className={styles.infoLabel}>{label}</div>
      <div className={styles.infoValue}>{value}</div>
    </div>
  )
}
