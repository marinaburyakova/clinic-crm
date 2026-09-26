'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebarStore } from '@/stores/sidebar'
import styles from './Sidebar.module.css'

type SidebarLinkProps = {
  href: string
  children: React.ReactNode
}

export default function SidebarLink({ href, children }: SidebarLinkProps) {
  const pathname = usePathname()
  const close = useSidebarStore((s) => s.close)

  const isActive = pathname === href || pathname.startsWith(href + '/')

  function handleClick() {
    close()
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`${styles.link} ${isActive ? styles.linkActive : ''}`}
    >
      {children}
    </Link>
  )
}
