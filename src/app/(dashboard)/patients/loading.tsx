import styles from './patients.module.css'

export default function Loading() {
  return (
    <div>
      <div className={styles.skeletonHeader} />
      <div className={styles.skeletonSearch} />
      <div className={styles.list}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard} />
        ))}
      </div>
    </div>
  )
}