'use client'

import { useTheme } from '@/hooks/use-theme'
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-react'

export function ThemeSwitcher() {
  const { toggleTheme, isDark, mounted } = useTheme()

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="hv-neutral-600 hover:hv-primary-500 transition-colors"
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">
        {isDark ? 'Passer au mode clair' : 'Passer au mode sombre'}
      </span>
    </Button>
  )
}

// Version simple toggle (pour mobile ou usage minimal)
export function SimpleThemeToggle() {
  const { toggleTheme, isDark, mounted } = useTheme()

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="hv-neutral-600 hover:hv-primary-500 transition-colors"
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">
        {isDark ? 'Passer au mode clair' : 'Passer au mode sombre'}
      </span>
    </Button>
  )
}