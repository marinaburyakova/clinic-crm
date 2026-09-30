'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { createSession, destroySession } from '@/lib/auth'
import { loginSchema } from '@/lib/validators'
import { checkRateLimit } from '@/lib/rate-limit'

export type LoginState = {
  error?: string
  values?: { email: string }
}

/**
 * Максимум 5 попыток логина за 15 минут:
 * - по IP (защита от перебора с одного адреса)
 * - по email (защита от перебора конкретного аккаунта)
 */
const LOGIN_RATE_LIMIT = { max: 5, windowSec: 15 * 60 }

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  // ─── 1. Валидация через Zod ───
  const parsed = loginSchema.safeParse({ email, password })
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0].message,
      values: { email },
    }
  }

  // ─── 2. Rate limiting ───
  // Определяем IP из заголовков (Nginx проставляет X-Forwarded-For)
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'unknown'

  // Два независимых лимита: по IP и по email.
  // Это защищает и от перебора с одного IP, и от распределённого перебора
  // одной учётки с разных IP.
  const ipLimit = checkRateLimit(`login:ip:${ip}`, LOGIN_RATE_LIMIT)
  const emailLimit = checkRateLimit(`login:email:${email}`, LOGIN_RATE_LIMIT)

  if (!ipLimit.ok || !emailLimit.ok) {
    const retryAfter = Math.max(
      ipLimit.retryAfter ?? 0,
      emailLimit.retryAfter ?? 0
    )
    const minutes = Math.ceil(retryAfter / 60)

    return {
      error: `Too many login attempts. Try again in ${minutes} min.`,
      values: { email },
    }
  }

  // ─── 3. Поиск пользователя ───
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  })

  // ─── 4. Проверка пароля ───
  // ВАЖНО: одинаковое сообщение для "нет user" и "неверный пароль" —
  // защита от user enumeration.
  const isValidPassword = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false

  if (!user || !isValidPassword) {
    return {
      error: 'Invalid email or password',
      values: { email },
    }
  }

  // ─── 5. Создание сессии ───
  await createSession(user.id, user.role)

  // ─── 6. Redirect ───
  // ВАЖНО: redirect() бросает NEXT_REDIRECT и должен быть ВНЕ try/catch.
  redirect('/dashboard')
}

export async function logoutAction() {
  await destroySession()
  redirect('/login')
}