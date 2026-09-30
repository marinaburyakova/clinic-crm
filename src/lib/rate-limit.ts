// src/lib/rate-limit.ts

type Bucket = {
  count: number
  resetAt: number
}

// In-memory storage. Для одного инстанса достаточно.
// Для нескольких инстансов — заменить на Redis.
const buckets = new Map<string, Bucket>()

// Чистим просроченные бакеты раз в 5 минут, чтобы Map не пух
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key)
    }
  }
}

type RateLimitOptions = {
  /** Максимум попыток в окне */
  max: number
  /** Окно в секундах */
  windowSec: number
}

type RateLimitResult = {
  ok: boolean
  /** Сколько секунд до сброса, если ok === false */
  retryAfter?: number
}

export function checkRateLimit(
  key: string,
  { max, windowSec }: RateLimitOptions
): RateLimitResult {
  cleanup()

  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    // Новое окно
    buckets.set(key, {
      count: 1,
      resetAt: now + windowSec * 1000,
    })
    return { ok: true }
  }

  if (bucket.count >= max) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
    return { ok: false, retryAfter }
  }

  bucket.count += 1
  return { ok: true }
}