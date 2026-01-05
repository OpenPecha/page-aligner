import { useEffect } from 'react'

import { useUIStore } from '@/store/use-ui-store'

/**
 * ThemeProvider component that applies the correct theme class to the document.
 * Handles 'system', 'light', and 'dark' theme preferences.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement

    // Function to apply the theme class
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    // Handle theme based on preference
    if (theme === 'system') {
      // Check system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mediaQuery.matches)

      // Listen for system preference changes
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // Apply explicit theme preference
      applyTheme(theme === 'dark')
    }
  }, [theme])

  return <>{children}</>
}

