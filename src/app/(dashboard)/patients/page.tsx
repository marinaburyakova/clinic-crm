import Link from 'next/link'
import { getPatients } from '@/features/patients/queries'
import PatientCard from '@/features/patients/components/PatientCard'
import PageHeader from '@/components/layout/PageHeader'
import styles from './patients.module.css'

type Props = {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function PatientsPage({ searchParams }: Props) {
  const params = await searchParams
  const query = params.q?.trim() ?? ''
  const page = Math.max(1, Number(params.page) || 1)

  const { patients, total, totalPages, page: currentPage } = await getPatients({
    query,
    page,
  })

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle={`${total} ${total === 1 ? 'patient' : 'patients'}`}
      />

      <form method="get" className={styles.search}>
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by name or phone…"
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      </form>

      {patients.length === 0 ? (
        <div className={styles.empty}>
          {query ? (
            <>No patients found for &laquo;{query}&raquo;.</>
          ) : (
            <>No patients yet.</>
          )}
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className={styles.pagination}>
              <PageLink
                page={currentPage - 1}
                query={query}
                disabled={currentPage <= 1}
              >
                ← Previous
              </PageLink>

              <span className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>

              <PageLink
                page={currentPage + 1}
                query={query}
                disabled={currentPage >= totalPages}
              >
                Next →
              </PageLink>
            </nav>
          )}
        </>
      )}
    </div>
  )
}

function PageLink({
  page,
  query,
  disabled,
  children,
}: {
  page: number
  query: string
  disabled: boolean
  children: React.ReactNode
}) {
  const sp = new URLSearchParams()
  if (query) sp.set('q', query)
  sp.set('page', String(page))
  const href = `/patients?${sp.toString()}`

  if (disabled) {
    return <span className={styles.pageLinkDisabled}>{children}</span>
  }

  return (
    <Link href={href} className={styles.pageLink}>
      {children}
    </Link>
  )
}