import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Timer, Volume2, VolumeX } from 'lucide-react'
import { useTheme } from './ThemeProvider'

type Mode = 'focus' | 'break'
const FOCUS_TIME = 25 * 60
const BREAK_TIME = 5 * 60

export default function PomodoroWidget() {
  const [mode, setMode] = useState<Mode>('focus')
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME)
  const [isActive, setIsActive] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const { themeColor } = useTheme()
  
  const audioContextRef = useRef<AudioContext | null>(null)

  const playAlarm = useCallback(() => {
    if (!soundEnabled) return
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioContextRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      // Generate a pleasant digital alert chirp
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime) // C5 note
      oscillator.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3) // Slide up to A5

      gainNode.gain.setValueAtTime(0.12, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.start()
      oscillator.stop(ctx.currentTime + 0.4e0)
    } catch (e) {
      console.warn('Audio Context is blocked or not supported on this browser context')
    }
  }, [soundEnabled])

  useEffect(() => {
    let interval: any = null
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setIsActive(false)
            playAlarm()
            const nextMode = mode === 'focus' ? 'break' : 'focus'
            setMode(nextMode)
            return nextMode === 'focus' ? FOCUS_TIME : BREAK_TIME
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isActive, mode, playAlarm])

  const toggleTimer = () => {
    setIsActive(!isActive)
    // Unlock AudioContext on user interaction
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME)
  }

  const switchMode = (newMode: Mode) => {
    setIsActive(false)
    setMode(newMode)
    setTimeLeft(newMode === 'focus' ? FOCUS_TIME : BREAK_TIME)
  }

  const formatTimeStr = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const totalTime = mode === 'focus' ? FOCUS_TIME : BREAK_TIME
  const percentage = ((totalTime - timeLeft) / totalTime) * 100

  const themeTextColor = themeColor === 'emerald' ? 'text-emerald-400' : 
                         themeColor === 'rose' ? 'text-rose-400' : 
                         themeColor === 'amber' ? 'text-amber-400' : 
                         themeColor === 'sky' ? 'text-sky-400' : 'text-purple-400'

  const themeBgColor = themeColor === 'emerald' ? 'bg-emerald-500/10' : 
                       themeColor === 'rose' ? 'bg-rose-500/10' : 
                       themeColor === 'amber' ? 'bg-amber-500/10' : 
                       themeColor === 'sky' ? 'bg-sky-500/10' : 'bg-purple-500/10'
                       
  const themeStroke = themeColor === 'emerald' ? '#34d399' : 
                      themeColor === 'rose' ? '#fb7185' : 
                      themeColor === 'amber' ? '#fbbf24' : 
                      themeColor === 'sky' ? '#38bdf8' : '#c084fc'

  const themeButtonBg = themeColor === 'emerald' ? 'bg-emerald-500' : 
                        themeColor === 'rose' ? 'bg-rose-500' : 
                        themeColor === 'amber' ? 'bg-amber-500' : 
                        themeColor === 'sky' ? 'bg-sky-500' : 'bg-purple-500'

  const themeButtonHover = themeColor === 'emerald' ? 'hover:bg-emerald-400' : 
                           themeColor === 'rose' ? 'hover:bg-rose-400' : 
                           themeColor === 'amber' ? 'hover:bg-amber-400' : 
                           themeColor === 'sky' ? 'hover:bg-sky-400' : 'hover:bg-purple-400'

  const themeShadow = themeColor === 'emerald' ? 'shadow-emerald-500/20' : 
                      themeColor === 'rose' ? 'shadow-rose-500/20' : 
                      themeColor === 'amber' ? 'shadow-amber-500/20' : 
                      themeColor === 'sky' ? 'shadow-sky-500/20' : 'shadow-purple-500/20'

  const colorClass = mode === 'focus' ? themeTextColor : 'text-sky-400'
  const strokeColor = mode === 'focus' ? themeStroke : '#38bdf8'
  const buttonBgClass = mode === 'focus' ? themeButtonBg : 'bg-sky-500'
  const buttonShadowClass = mode === 'focus' ? themeShadow : 'shadow-sky-500/20'
  const buttonHoverClass = mode === 'focus' ? themeButtonHover : 'hover:bg-sky-400'

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col h-full bg-slate-900/40 min-h-[400px] border border-white/10 backdrop-blur-md rounded-2xl p-6 select-none relative overflow-hidden group">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Timer className={`w-5 h-5 ${colorClass}`} />
          <span className={`${colorClass} font-semibold tracking-wider text-xs uppercase`}>Zen Pomodoro</span>
        </div>
        
        {/* Audio Mute toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          title={soundEnabled ? 'Mute alarm beep' : 'Unmute alarm beep'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
        </button>
      </div>

      {/* Primary Toggle pills */}
      <div className="flex justify-center gap-2.5 mb-6 relative z-10">
        <button 
          onClick={() => switchMode('focus')}
          className={`text-[10px] px-3.5 py-1.5 rounded-full uppercase tracking-widest font-extrabold transition-all duration-300 ${
            mode === 'focus' ? `${themeButtonBg} text-slate-950 shadow-lg ${themeShadow}` : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Focus Block
        </button>
        <button 
          onClick={() => switchMode('break')}
          className={`text-[10px] px-3.5 py-1.5 rounded-full uppercase tracking-widest font-extrabold transition-all duration-300 ${
            mode === 'break' ? 'bg-sky-500 text-slate-350 shadow-lg shadow-sky-500/20' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Break Interval
        </button>
      </div>

      {/* Circular Progress & Clock Body */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-2">
        <div className="relative flex items-center justify-center w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              className="stroke-white/5 fill-none"
              strokeWidth="6"
            />
            {/* Active Progress colored ring */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              className="fill-none transition-all duration-500 ease-out"
              strokeWidth="6"
              stroke={strokeColor}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Time digits */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-white tracking-widest font-mono">
              {formatTimeStr(timeLeft)}
            </span>
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500 mt-1 font-mono">
              {mode === 'focus' ? 'Stay Deep' : 'Chill'}
            </span>
          </div>
        </div>
      </div>

      {/* Countdown Controls Row */}
      <div className="flex items-center justify-center gap-4 mt-auto pt-4 border-t border-white/5 relative z-10">
        <button 
          onClick={resetTimer}
          className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95 text-slate-300 hover:text-white transition-all"
          title="Reset timers"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button 
          onClick={toggleTimer}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-slate-950 shadow-lg transform transition-all hover:scale-105 active:scale-95 ${buttonBgClass} ${buttonHoverClass} ${buttonShadowClass}`}
          title={isActive ? 'Pause' : 'Start'}
        >
          {isActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
        </button>
      </div>
    </div>
  )
}
