import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableWidgetProps {
  id: string;
  children: React.ReactNode;
}

export function SortableWidget({ id, children }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative' as const,
  }

  return (
    <div ref={setNodeRef} style={style} className={`h-full ${isDragging ? 'opacity-50' : ''}`}>
      {/* Modern drag handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/15 hover:bg-white/30 rounded-full cursor-grab active:cursor-grabbing z-50 transition-colors"
        title="Drag to reorder"
      />
      {children}
    </div>
  )
}
