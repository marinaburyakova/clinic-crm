import { CLINIC_TIMEZONE } from './config'

const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Возвращает ключ дня в формате YYYY-MM-DD в таймзоне клиники.
 *
 * Использует `'en-CA'` локаль (Canadian English), потому что она
 * отдаёт ISO 8601 формат без ручной сборки строки. Учитывает
 * `timeZone: CLINIC_TIMEZONE`, поэтому результат детерминирован
 * независимо от TZ сервера.
 *
 * Применяется для группировки приёмов по дню в UI. Не использовать
 * для сравнения дат в БД — там сравниваются Date объекты.
 *
 * @param date - Любая Date (в любой TZ)
 * @returns Строка вида '2026-09-24' в TZ клиники
 *
 * @example
 * getDayKey(new Date('2026-09-23T22:00:00Z'))  // '2026-09-24' (в MSK — уже 01:00)
 * getDayKey(new Date('2026-09-23T20:00:00Z'))  // '2026-09-23' (в MSK — 23:00)
 */
export function getDayKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

/**
 * Возвращает границы недели (понедельник 00:00:00 — воскресенье 23:59:59.999)
 * в таймзоне клиники.
 *
 * Алгоритм:
 * 1. Определяет день недели `reference` в TZ клиники через `Intl` (`en-GB`).
 * 2. Вычисляет сдвиг `diff` до понедельника (воскресенье → −6, иначе `1 − day`).
 * 3. Через `getDayKey` получает календарную дату в TZ клиники.
 * 4. Строит границы в **UTC** через `Date.UTC(...)`.
 *
 * Почему UTC: сравнения в БД (Prisma `DateTime` → `timestamptz`) идут по
 * абсолютному моменту времени. Если строить границы через локальные
 * `getFullYear()`/`getHours()`, результат зависит от TZ сервера — на dev
 * и проде недели разъедутся. `Date.UTC` даёт детерминированный момент,
 * который затем корректно сравнивается с UTC-значениями в БД.
 *
 * Возвращает `end` как `последнюю миллисекунду` воскресенья (23:59:59.999),
 * чтобы запрос `dateTime: { gte: start, lte: end }` включал весь день.
 *
 * @param reference - Любая дата внутри недели (по умолчанию — сейчас)
 * @returns `{ start, end }` — границы недели как Date в UTC
 *
 * @example
 * // Для 2026-09-24 (четверг) в Europe/Moscow:
 * const { start, end } = getWeekRange(new Date('2026-09-24T12:00:00Z'))
 * // start = 2026-09-21T00:00:00.000Z (пн)
 * // end   = 2026-09-27T23:59:59.999Z (вс)
 */
export function getWeekRange(reference: Date = new Date()): {
  start: Date
  end: Date
} {
  // Получаем день недели в TZ клиники
  const weekdayStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: CLINIC_TIMEZONE,
    weekday: 'short',
  }).format(reference)

  const weekdayMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 0,
  }
  const day = weekdayMap[weekdayStr]

  const diff = day === 0 ? -6 : 1 - day

  // Работаем в UTC, чтобы избежать сюрпризов с TZ сервера
  const dayKey = getDayKey(reference)
  const [year, month, dayOfMonth] = dayKey.split('-').map(Number)

  const mondayUTC = new Date(Date.UTC(year, month - 1, dayOfMonth + diff, 0, 0, 0, 0))
  const sundayUTC = new Date(mondayUTC.getTime() + 7 * MS_PER_DAY - 1)

  return { start: mondayUTC, end: sundayUTC }
}

/**
 * Возвращает границы «сегодня» в таймзоне клиники:
 * с 00:00:00.000 до 23:59:59.999 текущего календарного дня.
 *
 * «Сегодня» определяется **в TZ клиники**, а не в TZ сервера. Если сервер
 * в UTC, а клиника в Europe/Moscow, то в 23:00 UTC у клиники уже следующий
 * день — границы должны соответствовать московской дате.
 *
 * Реализация: через `getDayKey(reference)` берётся календарная дата в TZ
 * клиники, затем в UTC строятся начало и конец этого дня. Так границы
 * детерминированы и не зависят от TZ окружения.
 *
 * @param reference - Любая дата (по умолчанию — сейчас)
 * @returns `{ start, end }` — границы дня как Date в UTC
 *
 * @example
 * // 2026-09-23T22:00:00Z → в Москве уже 2026-09-24 01:00
 * const { start, end } = getTodayRange(new Date('2026-09-23T22:00:00Z'))
 * // start = 2026-09-24T00:00:00.000Z (по московской дате)
 * // end   = 2026-09-24T23:59:59.999Z
 */
export function getTodayRange(reference: Date = new Date()): {
  start: Date
  end: Date
} {
  const key = getDayKey(reference)
  const [year, month, day] = key.split('-').map(Number)

  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  const end = new Date(start.getTime() + MS_PER_DAY - 1)

  return { start, end }
}

/**
 * Возвращает человекочитаемую метку дня для ключа `YYYY-MM-DD`:
 * `'Today'`, `'Tomorrow'` или полную дату вида `'Friday, 26 September'`.
 *
 * «Сегодня» и «завтра» вычисляются **в момент вызова** через `getDayKey`
 * в TZ клиники. Это относительные понятия — их нельзя захардкодить,
 * и они зависят от текущего момента и таймзоны.
 *
 * Для произвольных дат строит `Date` в UTC из ключа и форматирует с
 * `timeZone: 'UTC'`, чтобы избежать повторного сдвига: ключ уже
 * представляет календарную дату в TZ клиники, и при форматировании
 * её не нужно снова переводить.
 *
 * Используется в UI для группировки приёмов по дням: пользователю важно
 * быстро понять, что приём сегодня, а не вычислять это из `2026-09-26`.
 *
 * @param dayKey - Ключ дня в формате `'YYYY-MM-DD'` (из `getDayKey`)
 * @returns `'Today'` | `'Tomorrow'` | `'Friday, 26 September'`
 *
 * @example
 * getDayLabel('2026-09-24')  // 'Today' (если сегодня 24-е)
 * getDayLabel('2026-09-25')  // 'Tomorrow'
 * getDayLabel('2026-09-26')  // 'Saturday, 26 September'
 */
export function getDayLabel(dayKey: string): string {
  const todayKey = getDayKey(new Date())
  const tomorrowKey = getDayKey(new Date(Date.now() + MS_PER_DAY))

  if (dayKey === todayKey) return 'Today'
  if (dayKey === tomorrowKey) return 'Tomorrow'

  const [year, month, day] = dayKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(date)
}

/**
 * Форматирует время приёма в 24-часовом формате `'HH:MM'` в таймзоне клиники.
 *
 * `timeZone` **обязателен**: без него `Intl` возьмёт зону окружения.
 * На сервере в UTC это даст время на 3 часа раньше московского, а на
 * клиенте — локальное время браузера. Результат будет разным на сервере
 * и клиенте → hydration mismatch и неверное время в UI.
 *
 * С `timeZone: CLINIC_TIMEZONE` форматирование детерминировано: и сервер,
 * и клиент показывают время в единой зоне клиники, независимо от TZ
 * окружения.
 *
 * @param date - Момент времени приёма (обычно из БД, в UTC)
 * @returns Строка вида `'14:30'` в TZ клиники
 *
 * @example
 * formatTime(new Date('2026-09-24T11:30:00Z'))  // '14:30' (в Europe/Moscow)
 * formatTime(new Date('2026-09-24T11:30:00Z'))  // '11:30' (если бы TZ = UTC)
 */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: CLINIC_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
/**
 * Сдвигает дату на N недель вперёд/назад.
 * Работает в UTC — избегает сюрпризов TZ сервера.
 */
export function shiftWeek(date: Date, weeks: number): Date {
  const shifted = new Date(date)
  shifted.setUTCDate(shifted.getUTCDate() + weeks * 7)
  return shifted
}

/**
 * Парсит параметр ?week=YYYY-MM-DD из URL.
 * Возвращает валидную Date (MSK 00:00) или текущую дату при ошибке.
 *
 * @param param - значение searchParams.week
 */
export function parseWeekParam(param: string | undefined): Date {
  if (!param) return new Date()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(param)) return new Date()

  const date = new Date(`${param}T00:00:00+03:00`)
  if (isNaN(date.getTime())) return new Date()

  return date
}

/**
 * Форматирует диапазон недели для отображения.
 * @returns строка вида '29 Sept — 05 Oct 2026'
 */
export function formatWeekRange(start: Date, end: Date): string {
  const startFmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: 'short',
  })
  const endFmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  return `${startFmt.format(start)} — ${endFmt.format(end)}`
}

/**
 * Формирует URL текущей страницы с новым параметром week.
 * Используется в WeekNavigator для ссылок Prev/Next/Today.
 */
export function getWeekUrl(basePath: string, weekStart: Date): string {
  // weekStart — понедельник недели в UTC.
  // Но weekStart в URL должен быть YYYY-MM-DD в MSK.
  const key = getDayKey(weekStart)
  return `${basePath}?week=${key}`
}
/**
 * Возвращает сетку месяца: 42 дня (6 недель × 7 дней),
 * начиная с понедельника той недели, где начинается месяц.
 * Все даты — в UTC, для детерминированности независимо от TZ сервера.
 *
 * @param reference - любая дата внутри месяца
 * @returns { days, monthStart, monthEnd }
 */
export function getMonthGrid(reference: Date): {
  days: Date[]
  monthStart: Date
  monthEnd: Date
} {
  const year = reference.getUTCFullYear()
  const month = reference.getUTCMonth()

  const firstOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
  const dayOfWeek = firstOfMonth.getUTCDay()
  const daysBack = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  const gridStart = new Date(firstOfMonth)
  gridStart.setUTCDate(firstOfMonth.getUTCDate() - daysBack)

  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart)
    d.setUTCDate(gridStart.getUTCDate() + i)
    days.push(d)
  }

  const monthEnd = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))

  return { days, monthStart: firstOfMonth, monthEnd }
}

/**
 * Парсит параметр ?month=YYYY-MM из URL.
 * Возвращает первое число месяца в UTC-полночь или текущую дату при ошибке.
 *
 * ВАЖНО: возвращает UTC Date — не смешивать с локальной TZ.
 * Все функции сетки (getMonthGrid) работают через getUTC* методы.
 *
 * @param param - значение searchParams.month
 */
export function parseMonthParam(param: string | undefined): Date {
  if (!param) return new Date()
  if (!/^\d{4}-\d{2}$/.test(param)) return new Date()

  const [year, month] = param.split('-').map(Number)
  if (month < 1 || month > 12) return new Date()

  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
}

/**
 * Форматирует месяц для отображения: "September 2026".
 */
export function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Moscow',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/**
 * Сдвигает дату на N месяцев вперёд/назад.
 */
export function shiftMonth(date: Date, months: number): Date {
  const shifted = new Date(date)
  shifted.setUTCMonth(shifted.getUTCMonth() + months)
  return shifted
}

/**
 * Формирует URL для /appointments?month=YYYY-MM.
 */
export function getMonthUrl(basePath: string, monthDate: Date): string {
  const year = monthDate.getUTCFullYear()
  const month = String(monthDate.getUTCMonth() + 1).padStart(2, '0')
  return `${basePath}?month=${year}-${month}`
}

/**
 * Возвращает человекочитаемую метку сегодня: "Today, 26 Sept".
 */
export function formatToday(): string {
  const now = new Date()
  const dateStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: 'short',
  }).format(now)
  return `Today, ${dateStr}`
}
/**
 * Возвращает текущую дату в MSK в человекочитаемом формате:
 * "Friday, 26 September 2026"
 */
export function formatFullDate(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Moscow',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
}