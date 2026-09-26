'use client'

import { useSidebarStore } from '@/stores/sidebar'
import styles from './SidebarBackdrop.module.css'

export default function SidebarBackdrop() {
  const isOpen = useSidebarStore((s) => s.isOpen)
  const close = useSidebarStore((s) => s.close)

  if (!isOpen) return null

  return (
    <div
      className={styles.backdrop}
      onClick={close}
      aria-hidden="true"
    />
  )
}