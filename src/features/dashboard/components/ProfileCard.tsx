import Image from 'next/image'
import type { Role } from '@/prisma/generated/client'
import styles from './ProfileCard.module.css'

type ProfileCardProps = {
  user: {
    name: string
    email: string
    role: Role
    avatarUrl: string | null
    specialty: string | null
    bio: string | null
    createdAt: Date
  }
}

function getInitials(name: string): string {
  const cleaned = name.replace(/^Dr\.?\s+/i, '').trim()
  const parts = cleaned.split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatMemberSince(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Moscow',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export default function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.photoWrapper}>
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.name}
            width={140}
            height={140}
            className={styles.photo}
            priority
          />
        ) : (
          <div className={styles.photoPlaceholder}>
            {getInitials(user.name)}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h1 className={styles.name}>Welcome, {user.name}</h1>

        <div className={styles.meta}>
          <span className={styles.role}>{user.role}</span>
          {user.specialty && (
            <>
              <span className={styles.separator}>·</span>
              <span className={styles.specialty}>{user.specialty}</span>
            </>
          )}
        </div>

        {user.bio && <p className={styles.bio}>{user.bio}</p>}

        <div className={styles.footer}>
          <span className={styles.email}>{user.email}</span>
          <span className={styles.separator}>·</span>
          <span className={styles.memberSince}>
            Member since {formatMemberSince(user.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}