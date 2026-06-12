import React from 'react'
import { useTheme, type ThemeColor } from './ThemeProvider'
import { Sparkles } from 'lucide-react'

const THEMES: { name: ThemeColor; class: string; glow: string }[] = [
  { name: 'emerald', class: 'bg-emerald-500', glow: 'shadow-emerald-500/50' },
  { name: 'rose', class: 'bg-rose-500', glow: 'shadow-rose-500/50' },
  { name: 'amber', class: 'bg-amber-500', glow: 'shadow-amber-500/50' },
  { name: 'sky', class: 'bg-sky-500', glow: 'shadow-sky-500/50' },
  { name: 'purple', class: 'bg-purple-500', glow: 'shadow-purple-500/50' },
]

export function ThemeSelector() {
  const { themeColor, setThemeColor } = useTheme()

  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-md">
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
        <Sparkles className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
        <span>Theme</span>
      </div>
      <div className="flex items-center gap-2">
        {THEMES.map((theme) => (
          <button
            key={theme.name}
            onClick={() => setThemeColor(theme.name)}
            className={`w-5 h-5 rounded-full transition-all duration-300 transform hover:scale-125 focus:outline-none ${theme.class} ${
              themeColor === theme.name
                ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 shadow-lg ' + theme.glow
                : 'opacity-60 hover:opacity-100'
            }`}
            title={`Switch to ${theme.name} theme`}
          />
        ))}
      </div>
    </div>
  )
}
