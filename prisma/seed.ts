import { PrismaClient } from './generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  const passwordHash = await bcrypt.hash('password123', 10)

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@clinic.local' },
    update: {},
    create: {
      email: 'admin@clinic.local',
      passwordHash,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  const doctor1 = await prisma.user.upsert({
    where: { email: 'doctor@clinic.local' },
    update: {
      avatarUrl: '/avatars/doctor-ivan.jpg',
      specialty: 'Therapist',
      bio: 'General practitioner with focus on preventive care. 8 years of clinical experience.',
    },
    create: {
      email: 'doctor@clinic.local',
      passwordHash,
      name: 'Dr. Ivan Petrov',
      role: 'DOCTOR',
      avatarUrl: '/avatars/doctor-ivan.jpg',
      specialty: 'Therapist',
      bio: 'General practitioner with focus on preventive care. 8 years of clinical experience.',
    },
  })

  const doctor2 = await prisma.user.upsert({
    where: { email: 'doctor2@clinic.local' },
    update: {
      avatarUrl: '/avatars/doctor-anna.jpg',
      specialty: 'Cardiologist',
      bio: 'Cardiologist specialising in preventive cardiology and arrhythmia management.',
    },
    create: {
      email: 'doctor2@clinic.local',
      passwordHash,
      name: 'Dr. Anna Smirnova',
      role: 'DOCTOR',
      avatarUrl: '/avatars/doctor-anna.jpg',
      specialty: 'Cardiologist',
      bio: 'Cardiologist specialising in preventive cardiology and arrhythmia management.',
    },
  })

  // Patients
  const patient1 = await prisma.patient.upsert({
    where: { phone: '+79990000001' },
    update: {},
    create: {
      firstName: 'Maria',
      lastName: 'Ivanova',
      phone: '+79990000001',
      email: 'maria@example.com',
      dateOfBirth: new Date('1985-05-15'),
      notes: 'Allergic to penicillin',
    },
  })

  const patient2 = await prisma.patient.upsert({
    where: { phone: '+79990000002' },
    update: {},
    create: {
      firstName: 'Alexey',
      lastName: 'Sokolov',
      phone: '+79990000002',
      dateOfBirth: new Date('1990-11-20'),
    },
  })

  // Appointments
  const now = new Date()
  const today9 = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    9,
    0,
  )
  const today10 = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    10,
    30,
  )
  const tomorrow14 = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    14,
    0,
  )

  await prisma.appointment.createMany({
    data: [
      {
        doctorId: doctor1.id,
        patientId: patient1.id,
        dateTime: today9,
        duration: 30,
        notes: 'Regular checkup',
      },
      {
        doctorId: doctor1.id,
        patientId: patient2.id,
        dateTime: today10,
        duration: 45,
        notes: 'Follow-up after tests',
      },
      {
        doctorId: doctor2.id,
        patientId: patient1.id,
        dateTime: tomorrow14,
        duration: 30,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✓ Seeded:', {
    admin: admin.email,
    doctors: [doctor1.email, doctor2.email],
    patients: [patient1.phone, patient2.phone],
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
