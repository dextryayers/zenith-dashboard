import React, { useState } from 'react'
import { ListTodo, Plus, Trash2, Tag, Calendar, CheckSquare, Square, AlertCircle } from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useTheme } from './ThemeProvider'

type TagLabel = 'Work' | 'Personal' | 'Important' | 'Other'

interface Task {
  id: string
  text: string
  completed: boolean
  tag: TagLabel
  isRecurring: boolean
  deadline: string
}

export default function TasksWidget() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('dashboard-tasks', [
    { id: '1', text: 'Structure zenith planning roadmap', completed: false, tag: 'Work', isRecurring: false, deadline: '' },
    { id: '2', text: 'Sync server databases', completed: true, tag: 'Work', isRecurring: true, deadline: '' },
    { id: '3', text: 'Stretch & take water break', completed: false, tag: 'Personal', isRecurring: true, deadline: '' },
    { id: '4', text: 'Settle subscription renewal', completed: false, tag: 'Important', isRecurring: false, deadline: '2026-06-15' },
  ])

  const [newTask, setNewTask] = useState('')
  const [selectedTag, setSelectedTag] = useState<TagLabel>('Work')
  const [isRecurring, setIsRecurring] = useState(false)
  const [deadline, setDeadline] = useState('')
  const { themeColor } = useTheme()

  const addTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      text: newTask.trim(),
      completed: false,
      tag: selectedTag,
      isRecurring,
      deadline
    }

    setTasks([...tasks, task])
    setNewTask('')
    setDeadline('')
    setIsRecurring(false)
  }

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const completedCount = tasks.filter((t) => t.completed).length

  const getTagColor = (tag: TagLabel) => {
    switch (tag) {
      case 'Work': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
      case 'Personal': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'Important': return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const isOverdue = (dateStr: string) => {
    if (!dateStr) return false
    const dDate = new Date(dateStr)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return dDate.getTime() < now.getTime()
  }

  const textColor = themeColor === 'emerald' ? 'text-emerald-400' : 
                    themeColor === 'rose' ? 'text-rose-400' : 
                    themeColor === 'amber' ? 'text-amber-400' : 
                    themeColor === 'sky' ? 'text-sky-400' : 'text-purple-400'

  const focusRing = themeColor === 'emerald' ? 'focus-visible:ring-emerald-500' : 
                    themeColor === 'rose' ? 'focus-visible:ring-rose-500' : 
                    themeColor === 'amber' ? 'focus-visible:ring-amber-500' : 
                    themeColor === 'sky' ? 'focus-visible:ring-sky-500' : 'focus-visible:ring-purple-500'

  const buttonBg = themeColor === 'emerald' ? 'bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-500/30 text-emerald-300' : 
                   themeColor === 'rose' ? 'bg-rose-500/20 hover:bg-rose-500/40 border-rose-500/30 text-rose-300' : 
                   themeColor === 'amber' ? 'bg-amber-500/20 hover:bg-amber-500/40 border-amber-500/30 text-amber-300' : 
                   themeColor === 'sky' ? 'bg-sky-500/20 hover:bg-sky-500/40 border-sky-500/30 text-sky-300' : 'bg-purple-500/20 hover:bg-purple-500/40 border-purple-500/30 text-purple-300'

  return (
    <div className="flex flex-col h-full bg-slate-900/40 min-h-[450px] border border-white/10 backdrop-blur-md rounded-2xl p-6 select-none relative overflow-hidden group">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <ListTodo className={`w-5 h-5 ${textColor}`} />
          <span className={`${textColor} font-semibold tracking-wider text-xs uppercase`}>Workspace Tasks</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">
          {completedCount}/{tasks.length} Done
        </span>
      </div>

      {/* Task input form */}
      <form onSubmit={addTask} className="space-y-3 mb-4 relative z-10">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a priority task..."
            className={`bg-slate-950/40 border border-white/10 rounded-lg px-3 py-1.5 flex-1 text-xs text-slate-200 outline-none transition-all ${focusRing} h-8`}
          />
          <button
            type="submit"
            className={`px-3 border rounded-lg transition-all flex items-center justify-center ${buttonBg} h-8`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Filters/parameters row */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-1.5 bg-slate-950/30 rounded-lg p-0.5 border border-white/5">
            {(['Work', 'Personal', 'Important', 'Other'] as TagLabel[]).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`text-[9px] px-2 py-1 rounded transition-all font-semibold ${
                  selectedTag === tag
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Due date input */}
            <div className="relative flex items-center">
              <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-2 cursor-pointer pointer-events-none" />
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-slate-950/30 border border-white/5 rounded-lg pl-7 pr-2 py-1 text-[9px] text-slate-300 outline-none h-6 select-all"
                title="Due date"
              />
            </div>

            {/* Recurring button */}
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={`text-[9px] px-2 py-1 rounded-lg border flex items-center gap-1 h-6 transition-all ${
                isRecurring 
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                  : 'bg-slate-950/30 text-slate-400 border-white/5'
              }`}
            >
              <span>♻️</span>
              <span className="font-semibold uppercase tracking-wider">Recur</span>
            </button>
          </div>
        </div>
      </form>

      {/* Task list list */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 relative z-10 max-h-[220px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ListTodo className="w-8 h-8 text-slate-600 mb-2 stroke-1" />
            <p className="text-xs text-slate-400 font-medium">All clear! No pending work.</p>
          </div>
        ) : (
          tasks
            .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1))
            .map((task) => (
              <div
                key={task.id}
                className={`flex gap-3 items-start justify-between p-3 rounded-xl border transition-all ${
                  task.completed
                    ? 'bg-slate-950/20 border-white/5 opacity-60'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className="shrink-0 mt-0.5 focus:outline-none text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {task.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>

                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <p className={`text-xs leading-relaxed break-words font-medium ${
                    task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                  }`}>
                    {task.text}
                  </p>
                  
                  {/* Footer metadata */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${getTagColor(task.tag)}`}>
                      {task.tag}
                    </span>
                    {task.isRecurring && (
                      <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                        Recurring
                      </span>
                    )}
                    {task.deadline && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border flex items-center gap-1 font-mono ${
                        isOverdue(task.deadline) && !task.completed
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/10'
                      }`}>
                        {isOverdue(task.deadline) && !task.completed && <AlertCircle className="w-2.5 h-2.5" />}
                        {task.deadline}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  className="shrink-0 text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors"
                  title="Remove task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  )
}
