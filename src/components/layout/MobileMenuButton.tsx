'use client'

import { useSidebarStore } from '@/stores/sidebar'
import styles from './MobileMenuButton.module.css'

export default function MobileMenuButton() {
  const toggle = useSidebarStore((s) => s.toggle)

  return (
    <button
      type="button"
      className={styles.button}
      onClick={toggle}
      aria-label="Toggle menu"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  )
}