import 'server-only'
import { prisma } from '@/lib/db'
import type { Prisma } from '@/prisma/generated/client'

const PAGE_SIZE = 20

export type PatientsFilter = {
  query?: string
  page?: number
}

export async function getPatients({ query = '', page = 1 }: PatientsFilter) {
  const trimmed = query.trim()

  const where: Prisma.PatientWhereInput | undefined = trimmed
    ? {
        OR: [
          { firstName: { contains: trimmed, mode: 'insensitive' } },
          { lastName: { contains: trimmed, mode: 'insensitive' } },
          { phone: { contains: trimmed } },
        ],
      }
    : undefined

  const skip = (page - 1) * PAGE_SIZE

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      skip,
      take: PAGE_SIZE,
    }),
    prisma.patient.count({ where }),
  ])

  return {
    patients,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    pageSize: PAGE_SIZE,
  }
}

  export async function getPatientById(id: string) {
  return prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: {
        orderBy: { dateTime: 'desc' },
        include: {
          doctor: {
            select: { id: true, name: true },
          },
        },
      },
    },
  })
}