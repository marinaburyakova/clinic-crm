'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  createAppointmentAction,
  type CreateAppointmentState,
} from '@/features/appointments/actions'
import Button from '@/components/ui/Button'
import styles from './CreateAppointmentForm.module.css'

type CreateAppointmentFormProps = {
  patientId: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creating…' : 'Create appointment'}
    </Button>
  )
}

export default function CreateAppointmentForm({
  patientId,
}: CreateAppointmentFormProps) {
  const [state, formAction] = useActionState<CreateAppointmentState, FormData>(
    createAppointmentAction,
    {}
  )

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="patientId" value={patientId} />

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>
            Date and time<span className={styles.required}>*</span>
          </span>
          <input
            type="datetime-local"
            name="dateTime"
            required
            className={styles.input}
          />
          {state.fieldErrors?.dateTime && (
            <span className={styles.fieldError}>
              {state.fieldErrors.dateTime}
            </span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            Duration (min)<span className={styles.required}>*</span>
          </span>
          <input
            type="number"
            name="duration"
            defaultValue={30}
            min={5}
            max={240}
            step={5}
            required
            className={styles.input}
          />
          {state.fieldErrors?.duration && (
            <span className={styles.fieldError}>
              {state.fieldErrors.duration}
            </span>
          )}
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Notes</span>
        <textarea
          name="notes"
          rows={3}
          placeholder="Optional notes…"
          className={styles.textarea}
        />
        {state.fieldErrors?.notes && (
          <span className={styles.fieldError}>
            {state.fieldErrors.notes}
          </span>
        )}
      </label>

      {state.error && <p className={styles.error}>{state.error}</p>}

      <div className={styles.actions}>
        <SubmitButton />
      </div>
    </form>
  )
}