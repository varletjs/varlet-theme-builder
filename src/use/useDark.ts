import { localStorage } from '@/utils/storage'
import { Themes } from '@varlet/ui'

export function useDark() {
  const saved = localStorage.get('prefer-dark')
  const isDark = ref(saved || (saved == null && window.matchMedia('(prefers-color-scheme: dark)').matches))

  function updateTheme() {
    StyleProvider(isDark.value ? Themes.md3Dark : Themes.md3Light)
    document.documentElement.style.setProperty('color-scheme', isDark.value ? 'dark' : 'light')
  }

  function toggleDark() {
    isDark.value = !isDark.value
    localStorage.set('prefer-dark', isDark.value)
    updateTheme()
  }

  updateTheme()

  return {
    isDark,
    toggleDark
  }
}
