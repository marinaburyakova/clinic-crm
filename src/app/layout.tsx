import type { Metadata } from 'next'
import ThemeApplier from '@/components/ThemeApplier'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clinic CRM — Marina Dev',
  description: 'Clinic management system for doctors and administrators.',
}

// Код минимизирован и защищен от кривого JSON в localStorage
const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('clinic-theme');
      var theme = 'dark';
      if (stored) {
        var parsed = JSON.parse(stored);
        theme = (parsed && parsed.state && parsed.state.theme) || 'dark';
      } else {
        theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      }
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Стандартный тег script в head работает железно для таких задач */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeApplier />
        {children}
      </body>
    </html>
  )
}
