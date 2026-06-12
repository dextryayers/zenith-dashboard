'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Loader2, Bot, Settings, X, SlidersHorizontal } from 'lucide-react'
import { useTheme } from './ThemeProvider'

// Web Speech API interfaces
const SpeechRecognition = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

export default function JarvisWidget() {
  const { themeColor } = useTheme()
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const isOpenRef = useRef(isOpen)
  const [showSettings, setShowSettings] = useState(false)
  
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('')
  const [speechRate, setSpeechRate] = useState<number>(1.0)
  
  const recognitionRef = useRef<any>(null)
  
  // Visualizer Refs
  const audioContextRef = useRef<any>(null)
  const analyserRef = useRef<any>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const sourceRef = useRef<any>(null)
  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const themeColorRef = useRef(themeColor)

  useEffect(() => {
    themeColorRef.current = themeColor
  }, [themeColor])

  const startVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext
      const audioContext = new AudioContextCtor()
      audioContextRef.current = audioContext
      
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser
      
      const source = audioContext.createMediaStreamSource(stream)
      sourceRef.current = source
      source.connect(analyser)
      
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      dataArrayRef.current = dataArray

      const canvas = canvasRef.current
      if (!canvas) return
      const canvasCtx = canvas.getContext('2d')
      if (!canvasCtx) return

      const draw = () => {
        if (!analyserRef.current || !dataArrayRef.current || !canvasRef.current) return
        
        rafRef.current = requestAnimationFrame(draw)
        
        analyserRef.current.getByteFrequencyData(dataArrayRef.current)
        
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
        
        const barWidth = (canvas.width / bufferLength) * 2.5
        let barHeight
        let x = 0
        
        const tColor = themeColorRef.current
        let r=168, g=85, b=247 // purple
        if (tColor === 'emerald') { r=16; g=185; b=129 }
        else if (tColor === 'rose') { r=244; g=63; b=94 }
        else if (tColor === 'amber') { r=245; g=158; b=11 }
        else if (tColor === 'sky') { r=14; g=165; b=233 }

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArrayRef.current[i] / 255 * canvas.height
          
          // Make it fade/gradient or simple solid
          canvasCtx.fillStyle = `rgb(${r}, ${g}, ${b})`
          canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
          
          x += barWidth + 1
        }
      }
      
      draw()
    } catch (err) {
      console.warn('Could not start audio visualizer:', err)
    }
  }

  const stopVisualizer = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop())
      streamRef.current = null
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }

  useEffect(() => {
    isOpenRef.current = isOpen
    if (!isOpen) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      stopListening()
      stopVisualizer()
      setIsProcessing(false)
    }
  }, [isOpen])
  
  // Create color styles based on theme
  const getGlowColor = () => {
    if (isProcessing) return 'bg-cyan-500 shadow-cyan-500/50'
    if (isListening) return 'bg-rose-500 shadow-rose-500/50 animate-pulse'
    
    switch (themeColor) {
      case 'emerald': return 'bg-emerald-500 shadow-emerald-500/20 hover:shadow-emerald-500/50'
      case 'rose': return 'bg-rose-500 shadow-rose-500/20 hover:shadow-rose-500/50'
      case 'amber': return 'bg-amber-500 shadow-amber-500/20 hover:shadow-amber-500/50'
      case 'sky': return 'bg-sky-500 shadow-sky-500/20 hover:shadow-sky-500/50'
      default: return 'bg-purple-500 shadow-purple-500/20 hover:shadow-purple-500/50'
    }
  }

  // Init greeting on first open
  const isFirstLoad = useRef(true)
  useEffect(() => {
    if (isOpen && isFirstLoad.current) {
        isFirstLoad.current = false
        setTimeout(() => {
          const greetings = [
            "Welcome to Zenith Workspace, Boss. All systems are online. How can I assist you today?",
            "Greetings, Boss. Zenith systems are fully operational. I am at your disposal.",
            "Good to see you, Boss. The workspace is prepared and waiting for your command.",
            "System initialized. I am ready when you are, Boss. What is our first objective?",
            "Welcome back, Boss. All protocols are active. Let me know what you need."
          ]
          const baseGreeting = greetings[Math.floor(Math.random() * greetings.length)]
          
          let taskSummary = ""
          try {
            const rawTasks = localStorage.getItem('dashboard-tasks')
            if (rawTasks) {
               const tasks = JSON.parse(rawTasks)
               if (Array.isArray(tasks)) {
                 const pendingTasks = tasks.filter(t => !t.completed)
                 if (pendingTasks.length > 0) {
                    taskSummary = ` You have ${pendingTasks.length} pending task${pendingTasks.length > 1 ? 's' : ''} on your agenda.`
                 } else if (tasks.length > 0) {
                    taskSummary = ` All tasks are completed for today. Excellent work.`
                 }
               }
            }
          } catch (err) {
             console.warn("Failed to parse tasks for greeting", err)
          }

          const finalGreeting = baseGreeting + taskSummary
          
          speakText(finalGreeting, () => {
             startListening()
          })
          setResponse(finalGreeting)
        }, 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices()
      const engVoices = allVoices.filter(v => v.lang.startsWith('en'))
      setVoices(engVoices)
      
      const savedRate = localStorage.getItem('jarvis-speech-rate')
      if (savedRate) setSpeechRate(parseFloat(savedRate))
        
      const savedVoice = localStorage.getItem('jarvis-voice-uri')
      if (savedVoice) {
         setSelectedVoiceURI(savedVoice)
      } else {
         const preferred = engVoices.find(v => 
            v.name.includes('Google UK English Male') || 
            v.name.includes('Daniel') ||
            v.name.includes('Google US English') ||
            (v.name.toLowerCase().includes('english') && v.name.toLowerCase().includes('male'))
         )
         if (preferred) setSelectedVoiceURI(preferred.voiceURI)
      }
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  // Process text with API
  const handleQuery = async (text: string) => {
    setIsProcessing(true)
    setTranscript(text)
    try {
      const res = await fetch('/api/jarvis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, history })
      })
      
      if (!res.ok) throw new Error('API Error')
      
      const data = await res.json()
      setResponse(data.text)
      setHistory(data.history || [])
      
      // Speak the response and start listening again after finishing
      speakText(data.text, () => {
         if (isOpenRef.current) {
             startListening()
         }
      })
    } catch (err) {
      console.error(err)
      const errorMsg = "I'm sorry Boss, my connection to the main frame was interrupted."
      setResponse(errorMsg)
      speakText(errorMsg, () => {
         if (isOpenRef.current) {
             startListening()
         }
      })
    } finally {
      setIsProcessing(false)
      setIsListening(false)
    }
  }

  const startListening = () => {
    if (!SpeechRecognition) {
       console.warn("Speech recognition is not supported in this browser.")
       return
    }

    if (isListening || isProcessing) return

    window.speechSynthesis.cancel() // Stop speaking if currently speaking
    
    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.interimResults = true
      recognitionRef.current = recognition

      let finalTranscriptAccumulated = ''

      recognition.onstart = () => {
        setIsListening(true)
        setTranscript('')
        recognitionRef.current.finalTranscriptStr = ''
        startVisualizer()
      }

      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        let currentFinal = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }
        
        if (currentFinal) {
            finalTranscriptAccumulated += currentFinal + ' '
        }
        
        const displayTranscript = finalTranscriptAccumulated + interimTranscript
        setTranscript(displayTranscript)
        recognitionRef.current.finalTranscriptStr = finalTranscriptAccumulated || interimTranscript
      }

      recognition.onend = () => {
        setIsListening(false)
        stopVisualizer()
        const finalTranscript = recognitionRef.current.finalTranscriptStr || transcript
        if (finalTranscript.trim()) {
          handleQuery(finalTranscript)
        }
      }

      recognition.start()
    } catch (err) {
      console.error(err)
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
       recognitionRef.current.stop()
    }
    setIsListening(false)
    stopVisualizer()
  }

  const toggleListen = () => {
    if (isListening) stopListening()
    else startListening()
  }

  const speakText = (text: string, onEnd?: () => void) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel() // clear queue
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      
      const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI)
      if (selectedVoice) {
        utterance.voice = selectedVoice
      } else {
        // Fallback to a firm, gentle, authoritative voice
        const preferredVoice = voices.find(v => 
           v.name.includes('Google UK English Male') || 
           v.name.includes('Daniel') ||
           v.name.includes('Google US English') ||
           (v.name.toLowerCase().includes('english') && v.name.toLowerCase().includes('male'))
        )
        if (preferredVoice) utterance.voice = preferredVoice
      }
      
      utterance.rate = speechRate
      utterance.pitch = 0.8 // slightly deeper/firmer
      
      if (onEnd) {
         utterance.onend = onEnd
      }

      window.speechSynthesis.speak(utterance)
    } else if (onEnd) {
       onEnd()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      
      {/* Dialogue Box */}
      {isOpen && (
        <div className="w-[320px] bg-slate-900/90 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl pointer-events-auto transform transition-all translate-y-0 opacity-100 font-sans">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-slate-300" />
              <h3 className="text-white font-semibold tracking-wide text-sm uppercase">J.A.R.V.I.S <span className="opacity-50 text-[10px]">v1.0</span></h3>
            </div>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="text-slate-400 hover:text-white transition-colors"
              title="Settings"
            >
              {showSettings ? <X className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
            </button>
          </div>
          
          {showSettings ? (
            <div className="min-h-[100px] max-h-[300px] overflow-y-auto scrollbar-thin text-xs text-slate-300 space-y-5 pr-1">
              <div className="space-y-2">
                <label className="block text-white font-medium text-[11px] uppercase tracking-wider">Voice Identity</label>
                <div className="relative">
                  <select 
                    value={selectedVoiceURI} 
                    onChange={(e) => {
                      setSelectedVoiceURI(e.target.value)
                      localStorage.setItem('jarvis-voice-uri', e.target.value)
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-white/30 truncate appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select English Voice</option>
                    {voices.map(v => (
                      <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    ▼
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-white font-medium text-[11px] uppercase tracking-wider">
                  <label>Speech Rate: {speechRate.toFixed(1)}x</label>
                </div>
                <input 
                  type="range" 
                  min="0.5" max="2.0" step="0.1" 
                  value={speechRate}
                  onChange={(e) => {
                    const r = parseFloat(e.target.value)
                    setSpeechRate(r)
                    localStorage.setItem('jarvis-speech-rate', r.toString())
                  }}
                  className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.5x</span>
                  <span>1.0x</span>
                  <span>2.0x</span>
                </div>
              </div>
              
              <button 
                onClick={() => speakText("Settings updated, Boss. All systems nominal.")}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-medium border border-white/10 uppercase tracking-widest text-[10px]"
              >
                Test Configuration
              </button>
            </div>
          ) : (
            <div className="min-h-[100px] max-h-[300px] overflow-y-auto scrollbar-thin text-xs text-slate-300 space-y-4">
               {/* Waveform Canvas */}
               <div className={`transition-all duration-300 ease-in-out overflow-hidden flex justify-center ${isListening ? 'h-10 opacity-100 mb-2' : 'h-0 opacity-0 mb-0'}`}>
                 <canvas ref={canvasRef} width={280} height={40} className="w-full h-10 bg-black/20 rounded-lg border border-white/5" />
               </div>

               {transcript && (
                 <div className="bg-white/5 p-3 flex rounded-lg">
                   <span className="text-white font-medium mr-2">Boss:</span> 
                   <p className="italic">&quot;{transcript}&quot;</p>
                 </div>
               )}
               
               {isProcessing && (
                 <div className="flex items-center gap-2 text-cyan-400 font-mono animate-pulse">
                   <Loader2 className="w-3.5 h-3.5 animate-spin" />
                   <span>Processing core request...</span>
                 </div>
               )}
               
               {response && !isProcessing && (
                 <div className="p-3 bg-black/20 rounded-lg border border-white/5 shadow-inner">
                   <span className="text-slate-400 font-medium block mb-1">Jarvis:</span>
                   <p className="leading-relaxed">{response}</p>
                 </div>
               )}
            </div>
          )}
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl pointer-events-auto text-white backdrop-blur-md relative border border-white/20 hover:scale-105 active:scale-95 ${getGlowColor()}`}
      >
        <div className={`absolute inset-0 rounded-full border-2 border-white/30 ${isListening ? 'animate-ping' : ''}`} />
        <Bot className={`w-6 h-6 z-10 transition-transform ${isOpen && !isListening ? 'scale-110' : ''}`} />
      </button>
      
      {/* Audio toggle control when open */}
      {isOpen && (
         <button
            onClick={toggleListen}
            disabled={isProcessing}
            className={`absolute bottom-0 -left-12 w-10 h-10 rounded-full flex items-center justify-center pointer-events-auto border transition-all ${
               isListening 
                 ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' 
                 : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isListening ? 'Stop Listening' : 'Start Listening'}
         >
           {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
         </button>
      )}

    </div>
  )
}
