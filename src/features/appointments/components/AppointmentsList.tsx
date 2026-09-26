'use client'

import { useOptimistic, useState, useTransition } from 'react'
import {
  deleteAppointmentAction,
  type DeleteAppointmentResult,
} from '@/features/appointments/actions'
import AppointmentListRow from './AppointmentListRow'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import styles from './AppointmentsList.module.css'

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

type AppointmentsListProps = {
  appointments: Appointment[]
}

export default function AppointmentsList({
  appointments,
}: AppointmentsListProps) {
  const [, startTransition] = useTransition()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const [optimisticAppointments, removeOptimistic] = useOptimistic(
    appointments,
    (state, idToRemove: string) => state.filter((a) => a.id !== idToRemove)
  )

  function handleDeleteRequest(id: string) {
    setPendingDeleteId(id)
  }

  function handleDeleteConfirm() {
    if (!pendingDeleteId) return
    const id = pendingDeleteId
    setPendingDeleteId(null)

    startTransition(async () => {
      removeOptimistic(id)
      const result: DeleteAppointmentResult = await deleteAppointmentAction(id)
      if (!result.success) {
        console.error('Delete failed:', result.error)
      }
    })
  }

  function handleDeleteCancel() {
    setPendingDeleteId(null)
  }

  if (optimisticAppointments.length === 0) {
    return (
      <div className={styles.empty}>No appointments on this day.</div>
    )
  }

  return (
    <>
      <div className={styles.list}>
        {optimisticAppointments.map((appt) => (
          <AppointmentListRow
            key={appt.id}
            appointment={appt}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete appointment?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  )
}