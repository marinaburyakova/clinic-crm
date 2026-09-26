'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/stores/theme'

export default function ThemeApplier() {
  const theme = useThemeStore((s) => s.theme)

  // 1. Безопасно подписываемся на статус гидратации Zustand.
  // На сервере это вернет false, на клиенте изменится на true БЕЗ вызова setState.
  const hasHydrated = useThemeStore((s) => s._hasHydrated)

  // 2. Запускаем гидратацию стора ОДИН раз при монтировании клиента
  useEffect(() => {
    if (typeof window !== 'undefined' && useThemeStore.persist) {
      useThemeStore.persist.rehydrate()
    }
  }, [])

  // 3. Синхронизируем тему с DOM, как только Zustand готов
  useEffect(() => {
    if (!hasHydrated) return

    document.documentElement.setAttribute('data-theme', theme)
  }, [theme, hasHydrated])

  return null
}
