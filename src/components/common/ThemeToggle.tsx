import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../../state/themeStore'
import { IconButton } from './IconButton'

/** Quick light/dark toggle. Cycling through "system" too is available in
 * Settings for anyone who wants to explicitly follow the OS instead. */
export function ThemeToggle() {
  const isDark = useThemeStore((s) => s.isDark)
  const setPreference = useThemeStore((s) => s.setPreference)

  return (
    <IconButton label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setPreference(isDark ? 'light' : 'dark')}>
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </IconButton>
  )
}
