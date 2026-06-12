import React, { useState, useEffect } from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { fetchWeather, type WeatherData, type ForecastData } from "@/lib/weather"
import { RefreshCw, Cloud, Wind, Droplets, MapPin, TrendingUp, Sunrise, Sunset, Search } from "lucide-react"
import { XAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { useTheme } from "./ThemeProvider"

export default function WeatherWidget() {
  const [city, setCity] = useLocalStorage<string>("weather-city", "London")
  const [searchInput, setSearchInput] = useState("")
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { themeColor } = useTheme()

  const loadWeatherData = async (targetCity: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWeather(targetCity)
      setWeather(data.weather)
      setForecast(data.forecast)
    } catch (err: any) {
      setError(err?.message || "Failed to load weather")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWeatherData(city)
  }, [city])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setCity(searchInput.trim())
      setSearchInput("")
    }
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

  const chartStroke = themeColor === 'emerald' ? '#34d399' : 
                      themeColor === 'rose' ? '#fb7185' : 
                      themeColor === 'amber' ? '#fbbf24' : 
                      themeColor === 'sky' ? '#38bdf8' : '#c084fc'

  const chartFillId = `weatherGlow-${themeColor}`

  return (
    <div className="flex flex-col h-full bg-slate-900/40 min-h-[450px] border border-white/10 backdrop-blur-md rounded-2xl p-6 select-none relative overflow-hidden group">
      {/* Absolute background card element */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Title Header */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Cloud className={`w-5 h-5 ${textColor}`} />
          <span className={`${textColor} font-semibold tracking-wider text-xs uppercase`}>Local Weather</span>
        </div>
        <button 
          onClick={() => loadWeatherData(city)} 
          disabled={loading}
          className="p-1 px-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-1.5 text-[10px] text-slate-400 active:scale-95"
          title="Refresh weather data"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-white' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      {/* Geocoding Search Box */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-4 relative z-10">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search city (e.g. Kyoto)..."
            className={`bg-slate-950/40 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 w-full text-xs text-slate-200 outline-none transition-all ${focusRing} h-8`}
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>
        <button
          type="submit"
          className={`px-3 py-1 text-xs border rounded-lg transition-all flex items-center justify-center font-medium ${buttonBg} h-8`}
        >
          Search
        </button>
      </form>

      {/* Weather Content body */}
      <div className="flex-1 flex flex-col relative z-10 justify-between">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6 gap-2">
            <RefreshCw className="w-8 h-8 text-slate-500 animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Gathering pressure records...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
            <p className="text-sm text-rose-400 font-semibold mb-2">Error</p>
            <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed mb-4">{error}</p>
            <button 
              onClick={() => loadWeatherData("London")}
              className="px-3 py-1.5 text-xs rounded bg-white/10 border border-white/10 hover:bg-white/20 transition-all text-white font-medium"
            >
              Reset to London
            </button>
          </div>
        ) : weather ? (
          <div className="flex-1 flex flex-col justify-between">
            {/* Main Stats Block */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {weather.name}
                </h3>
                <p className="text-xs text-slate-400 capitalize mt-0.5">{weather.weather[0].description}</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-white tracking-tighter">
                  {Math.round(weather.main.temp)}°C
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Feels: {Math.round(weather.main.feels_like)}°C</p>
              </div>
            </div>

            {/* Recharts Forecast Visualization */}
            <div className="h-28 w-full mt-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast} margin={{ top: 10, right: 5, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id={chartFillId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartStroke} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={chartStroke} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
                    itemStyle={{ color: '#f8fafc', fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value) => [`${value}°C`, 'Temp']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke={chartStroke} 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill={`url(#${chartFillId})`} 
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="absolute top-0 left-2 flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-semibold text-slate-500 font-mono">
                <TrendingUp className="w-3 h-3" />
                <span>24H Forecast</span>
              </div>
            </div>

            {/* Primary Metrics Row */}
            <div className="grid grid-cols-3 gap-2 py-3 mt-2 border-t border-white/5">
              <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-white/5">
                <Droplets className="w-4 h-4 text-sky-400 mb-1" />
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Humidity</span>
                <span className="text-sm font-bold text-slate-100">{weather.main.humidity}%</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-white/5">
                <Wind className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Wind</span>
                <span className="text-sm font-bold text-slate-100">{weather.wind.speed} m/s</span>
              </div>
              <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-white/5">
                <Cloud className="w-4 h-4 text-indigo-400 mb-1" />
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Sky</span>
                <span className="text-xs font-bold text-slate-100 truncate w-full text-center capitalize">{weather.weather[0].main}</span>
              </div>
            </div>

            {/* SECONDARY METADATA ROW - Sunrise and Sunset */}
            <div className="grid grid-cols-2 gap-4 py-2 border-t border-white/10 mt-2 bg-white/5 rounded-xl px-3">
              <div className="flex items-center gap-2">
                <Sunrise className={`w-4 h-4 ${textColor} shrink-0 animate-pulse`} />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">Sunrise</span>
                  <span className="text-xs font-bold text-emerald-300">
                    {weather.sys?.sunrise ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                <Sunset className={`w-4 h-4 ${textColor} shrink-0 animate-pulse`} />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">Sunset</span>
                  <span className="text-xs font-bold text-amber-300">
                    {weather.sys?.sunset ? new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
