import 'server-only'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables')
}

const secretKey = new TextEncoder().encode(JWT_SECRET)
const COOKIE_NAME = 'clinic_session'
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 дней в секундах

type SessionPayload = {
  userId: string
  role: 'ADMIN' | 'DOCTOR'
  expiresAt: string
}

// ─── Создание токена ───
export async function createSession(userId: string, role: 'ADMIN' | 'DOCTOR') {
  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000)

  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secretKey)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })

  return { expiresAt }
}

// ─── Проверка токена ───
export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    })
    return {
      userId: payload.userId as string,
      role: payload.role as 'ADMIN' | 'DOCTOR',
      expiresAt: new Date((payload.exp as number) * 1000).toISOString(),
    }
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  const session = await verifySession(token)
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      specialty: true,
      bio: true,
      createdAt: true,
    },
  })

  return user
}

// ─── Удалить сессию ───
export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
