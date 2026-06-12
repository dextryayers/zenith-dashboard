import React, { useState, useEffect } from 'react'
import { Coins, RefreshCw, ArrowLeftRight, TrendingUp } from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useTheme } from './ThemeProvider'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'IDR']

// Sample historic trends generator based on actual rate
const generateSampleTrends = (rate: number) => {
  const trends = []
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  for (let i = 0; i < 7; i++) {
    const variance = (Math.random() - 0.5) * 0.03 * rate
    trends.push({
      day: days[i],
      rate: parseFloat((rate + variance).toFixed(4))
    })
  }
  return trends
}

export default function CurrencyWidget() {
  const { themeColor } = useTheme()
  const [base, setBase] = useLocalStorage<string>('currency-base', 'USD')
  const [target, setTarget] = useLocalStorage<string>('currency-target', 'EUR')
  const [amount, setAmount] = useState<string>('100')
  const [rates, setRates] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRates = async (baseCurrency: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`)
      if (!response.ok) {
        throw new Error('Exchange rate engine failed')
      }
      const data = await response.json()
      if (data && data.rates) {
        setRates(data.rates)
      } else {
        throw new Error('Malformed API responses')
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch currencies')
      // Fallback relative to USD
      setRates({
        USD: 1.0,
        EUR: 0.92,
        GBP: 0.78,
        JPY: 154.5,
        IDR: 15900
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRates(base)
  }, [base])

  const swapCurrencies = () => {
    const prevBase = base
    setBase(target)
    setTarget(prevBase)
  }

  const currentRate = rates[target] || 1
  const convertedAmount = parseFloat(amount) ? (parseFloat(amount) * currentRate).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00'

  const sampleTrendsData = generateSampleTrends(currentRate)

  const textColor = themeColor === 'emerald' ? 'text-emerald-400' : 
                    themeColor === 'rose' ? 'text-rose-400' : 
                    themeColor === 'amber' ? 'text-amber-400' : 
                    themeColor === 'sky' ? 'text-sky-400' : 'text-purple-400'

  const focusRing = themeColor === 'emerald' ? 'focus-visible:ring-emerald-500' : 
                    themeColor === 'rose' ? 'focus-visible:ring-rose-500' : 
                    themeColor === 'amber' ? 'focus-visible:ring-amber-500' : 
                    themeColor === 'sky' ? 'focus-visible:ring-sky-500' : 'focus-visible:ring-purple-500'

  const selectBg = 'bg-slate-950/40 border-white/10 hover:border-white/20'

  const chartStroke = themeColor === 'emerald' ? '#34d399' : 
                      themeColor === 'rose' ? '#fb7185' : 
                      themeColor === 'amber' ? '#fbbf24' : 
                      themeColor === 'sky' ? '#38bdf8' : '#c084fc'

  return (
    <div className="flex flex-col h-full bg-slate-900/40 min-h-[400px] border border-white/10 backdrop-blur-md rounded-2xl p-6 select-none relative overflow-hidden group">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Coins className={`w-5 h-5 ${textColor}`} />
          <span className={`${textColor} font-semibold tracking-wider text-xs uppercase`}>Currency Converter</span>
        </div>
        
        <button 
          onClick={() => fetchRates(base)}
          disabled={loading}
          className="p-1 px-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1.5 text-[10px] text-slate-400"
          title="Sync live currency rates"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-white' : ''}`} />
          <span>Sync</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-8 h-8 text-slate-500 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">syncing international indices...</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between relative z-10">
          
          {/* Conversion Input Form row */}
          <div className="space-y-3.5 mb-2">
            <div className="grid grid-cols-5 gap-2 items-center">
              <div className="col-span-2">
                <label className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1 font-mono">Base</label>
                <select
                  value={base}
                  onChange={(e) => setBase(e.target.value)}
                  className={`bg-slate-950/40 border border-white/10 rounded-lg text-xs py-1 px-2 text-slate-200 outline-none w-full cursor-pointer h-8 ${focusRing}`}
                >
                  {CURRENCIES.map(curr => <option key={curr} value={curr} className="bg-slate-950">{curr}</option>)}
                </select>
              </div>

              <div className="col-span-1 flex items-end justify-center pt-4">
                <button
                  type="button"
                  onClick={swapCurrencies}
                  className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 active:scale-90 transition-all text-slate-400 hover:text-white"
                  title="Swap currencies"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              <div className="col-span-2">
                <label className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1 font-mono">Target</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className={`bg-slate-950/40 border border-white/10 rounded-lg text-xs py-1 px-2 text-slate-200 outline-none w-full cursor-pointer h-8 ${focusRing}`}
                >
                  {CURRENCIES.map(curr => <option key={curr} value={curr} className="bg-slate-950">{curr}</option>)}
                </select>
              </div>
            </div>

            {/* Inputs Box */}
            <div className="grid grid-cols-2 gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 font-semibold block uppercase tracking-wider font-mono">Amount ({base})</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent border-none text-base font-extrabold text-white outline-none w-full pl-0 select-all"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1 border-l border-white/10 pl-3">
                <span className="text-[9px] text-slate-400 font-semibold block uppercase tracking-wider font-mono">Converted ({target})</span>
                <div className="text-base font-extrabold text-emerald-400 truncate py-0.5 leading-none">
                  {convertedAmount}
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-500 font-mono text-center">
              Exchange rate: 1 {base} = {currentRate.toFixed(4)} {target}
            </p>
          </div>

          {/* Recharts Conversion Trend Visualization */}
          <div className="h-24 w-full mt-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sampleTrendsData} margin={{ top: 10, right: 3, left: 3, bottom: 0 }}>
                <XAxis 
                  dataKey="day" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
                  itemStyle={{ color: '#f8fafc', fontSize: '11px', fontWeight: 'bold' }}
                  formatter={(value) => [`${value} ${target}`, 'Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke={chartStroke} 
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="absolute top-0 left-2 flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-semibold text-slate-500 font-mono pointer-events-none">
              <TrendingUp className="w-3 h-3" />
              <span>{base} / {target} Weekly Trend</span>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
