'use client'

import React, { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'

import WeatherWidget from '@/components/WeatherWidget'
import WorldClock from '@/components/WorldClock'
import TasksWidget from '@/components/TasksWidget'
import SuggestionsWidget from '@/components/SuggestionsWidget'
import CurrencyWidget from '@/components/CurrencyWidget'
import PomodoroWidget from '@/components/PomodoroWidget'
import { SortableWidget } from '@/components/SortableWidget'
import { useTheme } from '@/components/ThemeProvider'
import { ThemeSelector } from '@/components/ThemeSelector'
import { useLocalStorage } from '@/hooks/useLocalStorage'

// Dynamically import Three.js background to avoid server rendering hydration mismatch
const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false })

const WIDGETS = {
  weather: { id: 'weather', colSpan: 'md:col-span-6 lg:col-span-4 xl:col-span-3', hClass: 'h-[450px]', component: WeatherWidget },
  worldclock: { id: 'worldclock', colSpan: 'md:col-span-12 lg:col-span-8 xl:col-span-6', hClass: 'h-[450px]', component: WorldClock },
  tasks: { id: 'tasks', colSpan: 'md:col-span-6 lg:col-span-4 xl:col-span-3', hClass: 'h-[450px]', component: TasksWidget },
  suggestions: { id: 'suggestions', colSpan: 'md:col-span-6 lg:col-span-4 xl:col-span-4', hClass: 'h-[400px]', component: SuggestionsWidget },
  currency: { id: 'currency', colSpan: 'md:col-span-6 lg:col-span-4 xl:col-span-4', hClass: 'h-[400px]', component: CurrencyWidget },
  pomodoro: { id: 'pomodoro', colSpan: 'md:col-span-12 lg:col-span-12 xl:col-span-4', hClass: 'h-[400px]', component: PomodoroWidget },
}

export default function Dashboard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const { themeColor } = useTheme()

  const [widgetOrder, setWidgetOrder] = useLocalStorage<string[]>('widget-order', [
    'weather', 'worldclock', 'tasks', 'suggestions', 'currency', 'pomodoro'
  ])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts to allow scrolling on mobile
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const ctx = gsap.context(() => {
      // stagger entry animation for all bento widget units
      gsap.from('section', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
      })
    }, containerRef)
    return () => ctx.revert()
  }, [mounted])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const getBackgroundGradient = () => {
    switch (themeColor) {
      case 'emerald': return 'from-emerald-950/30 via-slate-950/80 to-slate-950'
      case 'rose': return 'from-rose-950/30 via-slate-950/80 to-slate-950'
      case 'amber': return 'from-amber-950/30 via-slate-950/80 to-slate-950'
      case 'sky': return 'from-sky-950/30 via-slate-950/80 to-slate-950'
      default: return 'from-purple-950/30 via-slate-950/80 to-slate-950'
    }
  }

  // Fallback / missing widget safeguard
  const validWidgetSequence = widgetOrder.filter(id => WIDGETS[id as keyof typeof WIDGETS])
  Object.keys(WIDGETS).forEach(id => {
    if (!validWidgetSequence.includes(id)) {
      validWidgetSequence.push(id)
    }
  })

  const textColor = themeColor === 'emerald' ? 'text-emerald-400' : 
                    themeColor === 'rose' ? 'text-rose-400' : 
                    themeColor === 'amber' ? 'text-amber-400' : 
                    themeColor === 'sky' ? 'text-sky-400' : 'text-purple-400'

  return (
    <main 
      ref={containerRef}
      className={`relative min-h-screen w-full flex flex-col bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] px-4 md:px-8 xl:px-12 py-8 overflow-y-auto ${getBackgroundGradient()}`}
      style={{ transition: 'background-color 1s ease, background-image 1s ease' }}
    >
      <ThreeBackground />
      
      <div className="relative z-10 mx-auto w-full flex-1 flex flex-col">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 shrink-0 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Zenith <span className={`${textColor} transition-colors`}>Workspace</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Personalized, drag-sortable bento workspace. Grab any widget from the top center to reorder.
            </p>
          </div>
          
          <ThemeSelector />
        </header>

        {mounted ? (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col gap-6 flex-1 justify-center">
              <SortableContext 
                items={validWidgetSequence}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                  {validWidgetSequence.map((id) => {
                    const conf = WIDGETS[id as keyof typeof WIDGETS]
                    const Component = conf.component
                    return (
                      <section key={conf.id} className={`${conf.colSpan} ${conf.hClass}`}>
                        <SortableWidget id={conf.id}>
                          <Component />
                        </SortableWidget>
                      </section>
                    )
                  })}
                </div>
              </SortableContext>
            </div>
          </DndContext>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-slate-500 animate-pulse font-mono uppercase tracking-widest">Hydrating dashboard variables...</span>
          </div>
        )}

        {/* Bottom Status Bar */}
        <footer className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center shrink-0 gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 tracking-wider">
            <span>● SECURE SESSION</span>
            <span className="text-slate-700">|</span>
            <span>PERSISTENT SYNC ON</span>
          </div>
          <p className="text-[10px] font-mono text-slate-500">
            Powered by WebGL, Open API integrations & LocalStorage.
          </p>
        </footer>
      </div>
    </main>
  )
}
