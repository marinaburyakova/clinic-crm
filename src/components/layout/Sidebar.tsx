'use client'

import { useEffect } from 'react'
import type { Role } from '@/prisma/generated/client'
import { useSidebarStore } from '@/stores/sidebar'
import { logoutAction } from '@/features/auth/actions'
import SidebarLink from './SidebarLink'
import ThemeToggle from './ThemeToggle'
import styles from './Sidebar.module.css'

type SidebarProps = {
  user: {
    id: string
    email: string
    name: string
    role: Role
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const isOpen = useSidebarStore((s) => s.isOpen)
  const close = useSidebarStore((s) => s.close)

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}
    >
      <div className={styles.header}>
        <div className={styles.brand}>Clinic CRM</div>
        <ThemeToggle />
      </div>

      <nav className={styles.nav}>
        <SidebarLink href="/dashboard">Dashboard</SidebarLink>
        <SidebarLink href="/appointments">Appointments</SidebarLink>
        <SidebarLink href="/patients">Patients</SidebarLink>
      </nav>

      <div className={styles.user}>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user.name}</div>
          <div className={styles.userRole}>{user.role}</div>
        </div>
        <form action={logoutAction}>
          <button type="submit" className={styles.logout}>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}