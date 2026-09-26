'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createAppointmentSchema } from '@/lib/validators'

export type CreateAppointmentState = {
  error?: string
  fieldErrors?: Record<string, string>
}
export type DeleteAppointmentResult = {
  success: boolean
  error?: string
}

/**
 * Создаёт приём для указанного пациента от имени текущего врача.
 *
 * Границы доверия:
 * - `doctorId` берётся из сессии (getCurrentUser), НЕ из формы —
 *   клиент не может создать приём от имени другого врача.
 * - `dateTime` приходит строкой из `<input type="datetime-local">`
 *   и парсится с явным offset клиники (Europe/Moscow), не TZ сервера.
 * - `patientId` валидируется на существование в БД (защита от подмены
 *   через DevTools и от удалённых между рендером и submit пациентов).
 *
 * После успеха вызывает revalidatePath — страница пациента и список
 * приёмов обновятся автоматически.
 *
 * @param prevState - Предыдущее состояние (для useActionState)
 * @param formData - FormData из <form> (patientId, dateTime, duration, notes)
 * @returns Новое состояние с ошибками или пустой объект при успехе
 */
export async function createAppointmentAction(
  prevState: CreateAppointmentState,
  formData: FormData
): Promise<CreateAppointmentState> {
  // 1. Проверка авторизации
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'You must be signed in' }
  }

  // 2. Извлекаем поля из formData
  const raw = {
    patientId: formData.get('patientId'),
    dateTime: formData.get('dateTime'),
    duration: formData.get('duration') || '30',
    notes: formData.get('notes') || '',
  }

  // 3. Валидация через Zod
  const parsed = createAppointmentSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const path = issue.path[0]
      if (typeof path === 'string') {
        fieldErrors[path] = issue.message
      }
    }
    return { fieldErrors }
  }

  const { patientId, dateTime, duration, notes } = parsed.data

  // 4. Проверка, что пациент существует
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true },
  })
  if (!patient) {
    return { error: 'Patient not found' }
  }

  // 5. Создание приёма
  try {
    await prisma.appointment.create({
      data: {
        doctorId: user.id,
        patientId,
        dateTime,
        duration,
        notes: notes && notes.trim() ? notes.trim() : null,
      },
    })
  } catch (e) {
    console.error('Failed to create appointment:', e)
    return { error: 'Failed to create appointment. Please try again.' }
  }

  // 6. Инвалидация кэша страницы пациента
  revalidatePath(`/patients/${patientId}`)

  return {}
}
/**
 * Удаляет приём. Проверяет, что приём принадлежит текущему врачу.
 *
 * Границы доверия:
 * - doctorId берётся из сессии, НЕ из аргумента. Нельзя удалить чужой приём.
 * - Проверяем существование приёма ДО удаления (idempotent-friendly).
 *
 * После успеха — revalidatePath для страницы appointments и карточки пациента.
 */
export async function deleteAppointmentAction(
  appointmentId: string
): Promise<DeleteAppointmentResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'You must be signed in' }
  }

  // Проверяем, что приём существует и принадлежит этому врачу
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      doctorId: user.id,
    },
    select: {
      id: true,
      patientId: true,
    },
  })

  if (!appointment) {
    return { success: false, error: 'Appointment not found' }
  }

  try {
    await prisma.appointment.delete({
      where: { id: appointmentId },
    })
  } catch (e) {
    console.error('Failed to delete appointment:', e)
    return { success: false, error: 'Failed to delete appointment' }
  }

  revalidatePath('/appointments')
  revalidatePath(`/patients/${appointment.patientId}`)

  return { success: true }
}