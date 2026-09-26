import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'
import MobileMenuButton from '@/components/layout/MobileMenuButton'
import SidebarBackdrop from '@/components/layout/SidebarBackdrop'
import styles from './layout.module.css'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className={styles.layout}>
      <Sidebar user={user} />
      <SidebarBackdrop />
      <MobileMenuButton />
      <main className={styles.main}>{children}</main>
    </div>
  )
}
