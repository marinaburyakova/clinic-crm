'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { loginAction, type LoginState } from '@/features/auth/actions'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import styles from './LoginForm.module.css'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" fullWidth disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </Button>
  )
}

export default function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(
    loginAction,
    {}
  )

  return (
    <form action={formAction} className={styles.form}>
      <Input
        label="Email"
        name="email"
        type="email"
        defaultValue={state.values?.email}
        placeholder="doctor@clinic.local"
        autoComplete="email"
        required
      />

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        required
      />

      {state.error && <p className={styles.error}>{state.error}</p>}

      <SubmitButton />

      <p className={styles.hint}>
        Demo: <code>doctor@clinic.local</code> / <code>password123</code>
      </p>
    </form>
  )
}