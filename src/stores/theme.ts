import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

type ThemeState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
   _hasHydrated?: boolean
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
    }),
    {
      name: 'clinic-theme',
      skipHydration: true,
      // ЭТА ФУНКЦИЯ АВТОМАТИЧЕСКИ ВЫСТАВИТ _hasHydrated: true В СТОРЕ ПОСЛЕ ЗАВЕРШЕНИЯ
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Магия Zustand: изменение стейта здесь не ломает правила React
          state._hasHydrated = true 
        }
      },
    }
  )
)
