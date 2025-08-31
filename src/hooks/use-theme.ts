'use client'

import { useState, useEffect } from 'react'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Hydration safe - évite les mismatches SSR/Client
  useEffect(() => {
    setMounted(true)
    
    // Lire theme depuis localStorage ou système
    const savedTheme = localStorage.getItem('hv-theme') as Theme
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    
    const initialTheme = savedTheme || systemTheme
    setTheme(initialTheme)
    applyTheme(initialTheme)
    
    // Écouter changements système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('hv-theme')) {
        const newTheme = e.matches ? 'dark' : 'light'
        setTheme(newTheme)
        applyTheme(newTheme)
      }
    }
    
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    
    // Supprimer classe précédente
    root.classList.remove('light', 'dark')
    
    // Ajouter nouvelle classe
    root.classList.add(newTheme)
    
    // Attribut data pour CSS custom
    root.setAttribute('data-theme', newTheme)
  }

  const toggleTheme = () => {
    if (!mounted) return
    
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
    localStorage.setItem('hv-theme', newTheme)
  }

  const setThemeManual = (newTheme: Theme) => {
    if (!mounted) return
    
    setTheme(newTheme)
    applyTheme(newTheme)
    localStorage.setItem('hv-theme', newTheme)
  }

  const resetToSystem = () => {
    if (!mounted) return
    
    localStorage.removeItem('hv-theme')
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    setTheme(systemTheme)
    applyTheme(systemTheme)
  }

  return {
    theme: mounted ? theme : 'light', // Fallback pour SSR
    mounted,
    toggleTheme,
    setTheme: setThemeManual,
    resetToSystem,
    isDark: mounted ? theme === 'dark' : false,
    isLight: mounted ? theme === 'light' : true,
  }
}