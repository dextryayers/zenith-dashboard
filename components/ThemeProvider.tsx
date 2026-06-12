'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type ThemeColor = 'emerald' | 'rose' | 'amber' | 'sky' | 'purple'

interface ThemeContextType {
  themeColor: ThemeColor
  setThemeColor: (color: ThemeColor) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColor] = useState<ThemeColor>('purple')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-theme-color')
      if (saved) {
        setThemeColor(saved as ThemeColor)
      }
    }
  }, [])

  const changeTheme = (color: ThemeColor) => {
    setThemeColor(color)
    localStorage.setItem('dashboard-theme-color', color)
  }

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor: changeTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
