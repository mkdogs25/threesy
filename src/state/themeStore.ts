import { create } from 'zustand'

export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'threesy-theme'

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolveIsDark(preference: ThemePreference): boolean {
  return preference === 'dark' || (preference === 'system' && systemPrefersDark())
}

function applyTheme(preference: ThemePreference) {
  const isDark = resolveIsDark(preference)
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
}

function loadStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    // localStorage unavailable (private browsing, etc.) — fall back silently
  }
  return 'system'
}

interface ThemeState {
  preference: ThemePreference
  isDark: boolean
  setPreference: (preference: ThemePreference) => void
}

const initialPreference = loadStoredPreference()
if (typeof document !== 'undefined') applyTheme(initialPreference)

export const useThemeStore = create<ThemeState>((set) => ({
  preference: initialPreference,
  isDark: resolveIsDark(initialPreference),
  setPreference: (preference) => {
    applyTheme(preference)
    try {
      localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      // ignore — theme just won't persist across sessions
    }
    set({ preference, isDark: resolveIsDark(preference) })
  },
}))

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { preference } = useThemeStore.getState()
    if (preference !== 'system') return
    applyTheme('system')
    useThemeStore.setState({ isDark: resolveIsDark('system') })
  })
}
