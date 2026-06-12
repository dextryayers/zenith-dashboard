import React, { useState, useEffect } from 'react'
import { Clock, Globe, Sun, Moon, Plus, Trash2, Search, Compass, MapPin, X } from 'lucide-react'
import { useTheme } from './ThemeProvider'

// Standard preset database of major cities and countries across different regions
const AVAILABLE_CITIES = [
  { name: 'Local Time', zone: 'local', region: 'Device' },
  { name: 'London', zone: 'Europe/London', region: 'United Kingdom' },
  { name: 'New York', zone: 'America/New_York', region: 'United States' },
  { name: 'Tokyo', zone: 'Asia/Tokyo', region: 'Japan' },
  { name: 'Jakarta', zone: 'Asia/Jakarta', region: 'Indonesia' },
  { name: 'Paris', zone: 'Europe/Paris', region: 'France' },
  { name: 'Berlin', zone: 'Europe/Berlin', region: 'Germany' },
  { name: 'Sydney', zone: 'Australia/Sydney', region: 'Australia' },
  { name: 'Singapore', zone: 'Asia/Singapore', region: 'Singapore' },
  { name: 'Dubai', zone: 'Asia/Dubai', region: 'United Arab Emirates' },
  { name: 'Moscow', zone: 'Europe/Moscow', region: 'Russia' },
  { name: 'Seoul', zone: 'Asia/Seoul', region: 'South Korea' },
  { name: 'Cairo', zone: 'Africa/Cairo', region: 'Egypt' },
  { name: 'Los Angeles', zone: 'America/Los_Angeles', region: 'United States' },
  { name: 'Hong Kong', zone: 'Asia/Hong_Kong', region: 'China' },
  { name: 'Mumbai', zone: 'Asia/Kolkata', region: 'India' },
  { name: 'Auckland', zone: 'Pacific/Auckland', region: 'New Zealand' },
  { name: 'Cape Town', zone: 'Africa/Johannesburg', region: 'South Africa' },
  { name: 'Sao Paulo', zone: 'America/Sao_Paulo', region: 'Brazil' },
  { name: 'UTC', zone: 'UTC', region: 'Coordinated Universal' }
]

export default function WorldClock() {
  const { themeColor } = useTheme()
  const [time, setTime] = useState<Date | null>(null)
  const [clocks, setClocks] = useState<{ name: string; zone: string; region: string }[]>([])
  const [selectedTz, setSelectedTz] = useState<string>('local')
  const [isAdding, setIsAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Load user clocks from localStorage or default list
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zenith-world-clocks')
      if (saved) {
        try {
          setClocks(JSON.parse(saved))
        } catch (e) {
          // fallback
          setDefaultClocks()
        }
      } else {
        setDefaultClocks()
      }
    }
    setTime(new Date())
    
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  const setDefaultClocks = () => {
    const defaults = [
      { name: 'Local Time', zone: 'local', region: 'Device' },
      { name: 'London', zone: 'Europe/London', region: 'United Kingdom' },
      { name: 'New York', zone: 'America/New_York', region: 'United States' },
      { name: 'Tokyo', zone: 'Asia/Tokyo', region: 'Japan' },
      { name: 'Jakarta', zone: 'Asia/Jakarta', region: 'Indonesia' },
      { name: 'UTC', zone: 'UTC', region: 'Universal' }
    ]
    setClocks(defaults)
    if (typeof window !== 'undefined') {
      localStorage.setItem('zenith-world-clocks', JSON.stringify(defaults))
    }
  }

  const formatTime = (date: Date, zone: string, formatOptions: Intl.DateTimeFormatOptions) => {
    try {
      if (zone === 'local') {
        return new Intl.DateTimeFormat('en-US', formatOptions).format(date)
      }
      return new Intl.DateTimeFormat('en-US', {
        ...formatOptions,
        timeZone: zone
      }).format(date)
    } catch (e) {
      return '--:--'
    }
  }

  const isNight = (date: Date, zone: string) => {
    try {
      const hourStr = formatTime(date, zone, { hour12: false, hour: 'numeric' })
      const hour = parseInt(hourStr)
      return hour < 6 || hour > 18
    } catch {
      return false
    }
  }

  const handleAddClock = (city: typeof AVAILABLE_CITIES[0]) => {
    if (clocks.some(c => c.zone === city.zone)) {
      // Already added
      setIsAdding(false)
      return
    }
    const newList = [...clocks, city]
    setClocks(newList)
    localStorage.setItem('zenith-world-clocks', JSON.stringify(newList))
    setSelectedTz(city.zone)
    setIsAdding(false)
    setSearchQuery('')
  }

  const handleDeleteClock = (zoneToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent selecting the clock
    if (zoneToDelete === 'local') return // Cannot delete local time
    
    const newList = clocks.filter(c => c.zone !== zoneToDelete)
    setClocks(newList)
    localStorage.setItem('zenith-world-clocks', JSON.stringify(newList))
    
    if (selectedTz === zoneToDelete) {
      setSelectedTz('local')
    }
  }

  // Get offset string relative to UTC
  const getTimezoneOffset = (zone: string) => {
    if (zone === 'local') return 'Host'
    try {
      const utcDate = new Date()
      const tzDate = new Date(utcDate.toLocaleString('en-US', { timeZone: zone }))
      const localUrlDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'UTC' }))
      const diffMs = tzDate.getTime() - localUrlDate.getTime()
      const diffHours = Math.round(diffMs / (1000 * 60 * 60))
      return diffHours >= 0 ? `UTC+${diffHours}` : `UTC${diffHours}`
    } catch (e) {
      return ''
    }
  }

  const textColor = themeColor === 'emerald' ? 'text-emerald-400' : 
                    themeColor === 'rose' ? 'text-rose-400' : 
                    themeColor === 'amber' ? 'text-amber-400' : 
                    themeColor === 'sky' ? 'text-sky-400' : 'text-purple-400'

  const hoverBorderColor = themeColor === 'emerald' ? 'hover:border-emerald-500/40' : 
                           themeColor === 'rose' ? 'hover:border-rose-500/40' : 
                           themeColor === 'amber' ? 'hover:border-amber-500/40' : 
                           themeColor === 'sky' ? 'hover:border-sky-500/40' : 'hover:border-purple-500/40'

  const focusBorderColor = themeColor === 'emerald' ? 'border-emerald-500/45' : 
                           themeColor === 'rose' ? 'border-rose-500/45' : 
                           themeColor === 'amber' ? 'border-amber-500/45' : 
                           themeColor === 'sky' ? 'border-sky-500/45' : 'border-purple-500/45'

  const blurColor = themeColor === 'emerald' ? 'bg-emerald-500/10' : 
                    themeColor === 'rose' ? 'bg-rose-500/10' : 
                    themeColor === 'amber' ? 'bg-amber-500/10' : 
                    themeColor === 'sky' ? 'bg-sky-500/10' : 'bg-purple-500/10'

  const highlightBorder = themeColor === 'emerald' ? 'border-emerald-500/35' : 
                            themeColor === 'rose' ? 'border-rose-500/35' : 
                            themeColor === 'amber' ? 'border-amber-500/35' : 
                            themeColor === 'sky' ? 'border-sky-500/35' : 'border-purple-500/35'

  const filteredCities = AVAILABLE_CITIES.filter(city => 
    !clocks.some(clock => clock.zone === city.zone) &&
    (city.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     city.region.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (!time) {
    return (
      <div className="flex flex-col h-full bg-slate-900/40 min-h-[450px] border border-white/10 backdrop-blur-md rounded-2xl p-6 flex-1 items-center justify-center">
        <Clock className="w-8 h-8 text-slate-500 animate-pulse" />
      </div>
    )
  }

  // Find info of the focused timezone
  const activeClock = clocks.find(c => c.zone === selectedTz) || { name: 'Local Time', zone: 'local', region: 'Device' }

  return (
    <div className="flex flex-col h-full bg-slate-900/40 min-h-[450px] border border-white/10 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden group select-none">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-5 relative z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Globe className={`w-5 h-5 ${textColor}`} />
          <span className={`${textColor} font-semibold tracking-wider text-xs uppercase`}>Chronometer Hub</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white/5 hover:bg-white/10 rounded-full border border-white/15 transition-all cursor-pointer ${textColor}`}
          >
            {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{isAdding ? 'Close' : 'Add Clock'}</span>
          </button>
        </div>
      </div>

      {/* Adding dropdown portal */}
      {isAdding && (
        <div className="absolute inset-x-4 top-14 bg-slate-900/95 border border-white/15 rounded-xl p-4 shadow-xl z-50 backdrop-blur-lg flex flex-col max-h-[300px]">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 mb-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input 
              type="text"
              placeholder="Search world city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:outline-none w-full font-sans"
              autoFocus
            />
          </div>
          
          <div className="overflow-y-auto scrollbar-thin space-y-1 flex-1 pr-1">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city.zone}
                  onClick={() => handleAddClock(city)}
                  className="w-full flex items-center justify-between text-left p-2 hover:bg-white/5 rounded-lg transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
                    <div>
                      <span className="text-xs font-semibold text-white block">{city.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{city.region}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-white/10 text-slate-400 px-2 py-0.5 rounded font-mono">
                    {getTimezoneOffset(city.zone)}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-[11px] text-slate-500 text-center py-4 font-mono">No new matching world cities.</p>
            )}
          </div>
        </div>
      )}

      {/* Main Big Time Display for Focus Tz */}
      <div className="flex-1 flex flex-col justify-center items-center py-4 text-center relative z-10 shrink-0">
        <div className={`p-4 rounded-full ${blurColor} border border-white/5 mb-3 animate-pulse relative`}>
          {isNight(time, activeClock.zone) ? (
            <Moon className="w-8 h-8 text-indigo-300" />
          ) : (
            <Sun className={`w-8 h-8 ${themeColor === 'amber' ? 'text-amber-400' : 'text-yellow-400'}`} />
          )}
        </div>

        <div className="text-4xl md:text-5xl font-black tracking-widest text-white leading-none font-mono filter drop-shadow-md">
          {formatTime(time, activeClock.zone, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        
        <p className="text-sm font-semibold text-slate-200 mt-2.5 capitalize font-mono flex items-center gap-1.5">
          <Compass className={`w-3.5 h-3.5 ${textColor}`} />
          {activeClock.name === 'Local Time' ? 'Local System Time' : activeClock.name}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-mono flex items-center gap-2">
          <span>{activeClock.region}</span>
          <span>•</span>
          <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[9px] text-white">
            {getTimezoneOffset(activeClock.zone)}
          </span>
        </p>
      </div>

      {/* List of Loaded Clocks (Bento Horizontal scroll/grid list with persistent custom content) */}
      <div className="mt-4 border-t border-white/5 pt-4 shrink-0">
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2.5">
          Active Clocks ({clocks.length})
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[145px] overflow-y-auto pr-1 scrollbar-thin">
          {clocks.map((tz) => {
            const isCurrentNight = isNight(time, tz.zone)
            const active = selectedTz === tz.zone
            const isLocal = tz.zone === 'local'
            return (
              <div
                key={tz.zone}
                onClick={() => setSelectedTz(tz.zone)}
                className={`flex items-center justify-between p-2 rounded-xl border transition-all text-left relative group cursor-pointer ${
                  active 
                    ? `${blurColor} text-white ${highlightBorder} ${focusBorderColor} shadow-lg shadow-white/5` 
                    : `bg-white/5 border-transparent text-slate-300 hover:bg-white/10 hover:border-white/5 ${hoverBorderColor}`
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[10px] text-slate-300 font-mono block truncate font-bold uppercase">{tz.name}</span>
                    <span className="text-[8px] opacity-45 font-mono">({getTimezoneOffset(tz.zone)})</span>
                  </div>
                  <span className="text-xs font-bold text-white font-mono block">
                    {formatTime(time, tz.zone, { hour12: false, hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="shrink-0 flex items-center gap-1 pl-1">
                  <div>
                    {isCurrentNight ? (
                      <Moon className="w-3.5 h-3.5 text-indigo-300 opacity-60 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <Sun className={`w-3.5 h-3.5 ${themeColor === 'amber' ? 'text-amber-400/80' : 'text-yellow-400/80'} opacity-80 group-hover:opacity-100 transition-opacity`} />
                    )}
                  </div>
                  
                  {!isLocal && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClock(tz.zone, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition-all cursor-pointer"
                      title={`Remove ${tz.name}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
