import React, { useState, useEffect } from 'react'
import { Sparkles, ChevronLeft, ChevronRight, Lightbulb, Flame, Brain, ShieldAlert, HeartPulse } from 'lucide-react'
import { useTheme } from './ThemeProvider'

interface Suggestion {
  icon: React.ElementType
  title: string
  desc: string
  category: 'Wellness' | 'Focus' | 'Technical' | 'Rest'
}

const SUGGESTIONS: Suggestion[] = [
  {
    icon: HeartPulse,
    title: 'Maintain 20-20-20 Rule',
    desc: 'Every 20 minutes, look at an object at least 20 feet away for 20 seconds to minimize digital eye strain.',
    category: 'Wellness'
  },
  {
    icon: Brain,
    title: 'Hydration Cycle',
    desc: 'Keep an insulated water bottle on your desk. Dehydration degrades cognitive speed and working memory by over 10%.',
    category: 'Focus'
  },
  {
    icon: Flame,
    title: 'Micro-movements Spark',
    desc: 'Slightly shift your sitting posture or do standing calves-raisers for 30 seconds every hour to keep oxygen fluid.',
    category: 'Rest'
  },
  {
    icon: ShieldAlert,
    title: 'Clean Digital Workspace',
    desc: 'Minimize sensory fatigue by closing passive browser tabs and muting non-vital status notifications during deep focus blocks.',
    category: 'Technical'
  },
  {
    icon: Sparkles,
    title: 'Batch Communication',
    desc: 'Try checking and responding to emails and messages in designated windows (e.g., 10AM, 2PM, 4PM) rather than constantly checking.',
    category: 'Focus'
  }
]

export default function SuggestionsWidget() {
  const { themeColor } = useTheme()
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SUGGESTIONS.length)
    }, 12000)
    return () => clearInterval(timer)
  }, [])

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + SUGGESTIONS.length) % SUGGESTIONS.length)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % SUGGESTIONS.length)
  }

  const active = SUGGESTIONS[currentIndex]
  const ActiveIcon = active.icon

  const textColor = themeColor === 'emerald' ? 'text-emerald-400' : 
                    themeColor === 'rose' ? 'text-rose-400' : 
                    themeColor === 'amber' ? 'text-amber-400' : 
                    themeColor === 'sky' ? 'text-sky-400' : 'text-purple-400'

  const iconBg = themeColor === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 
                 themeColor === 'rose' ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 
                 themeColor === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 
                 themeColor === 'sky' ? 'bg-sky-500/10 border-sky-500/20 text-sky-300' : 'bg-purple-500/10 border-purple-500/20 text-purple-300'

  const themeBorder = themeColor === 'emerald' ? 'border-emerald-500/30' : 
                      themeColor === 'rose' ? 'border-rose-500/30' : 
                      themeColor === 'amber' ? 'border-amber-500/30' : 
                      themeColor === 'sky' ? 'border-sky-500/30' : 'border-purple-500/30'

  return (
    <div className="flex flex-col h-full bg-slate-900/40 min-h-[400px] border border-white/10 backdrop-blur-md rounded-2xl p-6 select-none relative overflow-hidden group">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Lightbulb className={`w-5 h-5 ${textColor}`} />
          <span className={`${textColor} font-semibold tracking-wider text-xs uppercase`}>Workspace Insights</span>
        </div>
        
        {/* Navigation Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevSlide}
            className="p-1 rounded-md bg-white/5 border border-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all active:scale-90"
            title="Previous tip"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="p-1 rounded-md bg-white/5 border border-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all active:scale-90"
            title="Next tip"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 flex flex-col justify-center relative z-10 px-2 text-center items-center">
        <div className={`p-4 rounded-2xl border ${iconBg} mb-4 relative flex items-center justify-center animate-bounce`}>
          <ActiveIcon className="w-7 h-7" />
        </div>

        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1 font-mono">
          {active.category}
        </span>
        <h4 className="text-base font-extrabold text-white mb-2 leading-tight">
          {active.title}
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed max-w-[280px]">
          {active.desc}
        </p>
      </div>

      {/* Bottom sliding dots indicator */}
      <div className="flex justify-center gap-2 mt-auto pt-4 border-t border-white/5 relative z-10">
        {SUGGESTIONS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1 rounded-full transition-all duration-300 focus:outline-none ${
              idx === currentIndex 
                ? 'w-4 ' + textColor.replace('text-', 'bg-') 
                : 'w-1.5 bg-white/20 hover:bg-white/45'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
