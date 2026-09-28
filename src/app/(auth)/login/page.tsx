import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import LoginForm from '@/components/forms/LoginForm'
import styles from './login.module.css'

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Clinic CRM</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </header>

        <LoginForm />
      </div>
    </main>
  )
}