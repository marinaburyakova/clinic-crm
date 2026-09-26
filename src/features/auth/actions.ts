'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createSession, destroySession } from '@/lib/auth'
import { loginSchema } from '@/lib/validators'

export type LoginState = {
  error?: string
  values?: { email: string }
}

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Валидация через Zod
  const parsed = loginSchema.safeParse({ email, password })
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0].message,
      values: { email },
    }
  }

  // Ищем пользователя
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  })

  if (!user) {
    return {
      error: 'Invalid email or password',
      values: { email },
    }
  }

  // Проверяем пароль
  const isValidPassword = await bcrypt.compare(password, user.passwordHash)
  if (!isValidPassword) {
    return {
      error: 'Invalid email or password',
      values: { email },
    }
  }

  // Создаём сессию
  await createSession(user.id, user.role)

  // Редирект
  redirect('/dashboard')
}

export async function logoutAction() {
  await destroySession()
  redirect('/login')
}