import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Pause, Play, X } from 'lucide-react'
import { Button } from './ui/button'
import { BreathingOrb } from './BreathingOrb'
import { useSessionAutoSave } from './SessionAutoSave'

interface BreathPattern {
  inhale: number
  hold: number
  exhale: number
  pause: number
}

interface SessionScreenProps {
  pattern: BreathPattern
  patternName?: string
  onExit: (sessionData: SessionData) => void
}

interface SessionData {
  duration: number
  cycles: number
  pattern: BreathPattern
  patternName?: string
}

export function SessionScreen({ pattern, patternName, onExit }: SessionScreenProps) {
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale')
  const [isActive, setIsActive] = useState(true)
  const [cycles, setCycles] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [sessionDuration, setSessionDuration] = useState(0)
  const [showInstructions, setShowInstructions] = useState(true)
  const [totalCycles] = useState(10) // Default target cycles
  
  const startTimeRef = useRef<number>(Date.now())
  const phaseTimeoutRef = useRef<NodeJS.Timeout>()
  const durationIntervalRef = useRef<NodeJS.Interval>()
  const autoSaveIntervalRef = useRef<NodeJS.Interval>()
  
  const { saveSession, clearSavedSession } = useSessionAutoSave()

  const phaseInstructions = {
    inhale: 'Breathe In',
    hold: 'Hold',
    exhale: 'Breathe Out',
    pause: 'Pause'
  }

  const totalCycleTime = pattern.inhale + pattern.hold + pattern.exhale + pattern.pause

  // Hide instructions after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowInstructions(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Session duration tracker
  useEffect(() => {
    durationIntervalRef.current = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [])

  // Auto-save session progress every 5 seconds when active
  useEffect(() => {
    if (isActive && cycles > 0) {
      autoSaveIntervalRef.current = setInterval(() => {
        saveSession(
          pattern,
          patternName,
          {
            cyclesCompleted: cycles,
            totalCycles: totalCycles,
            timeElapsed: sessionDuration,
            currentPhase,
            phaseTimeRemaining: timeRemaining
          },
          sessionDuration
        )
      }, 5000)
    } else {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current)
      }
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current)
      }
    }
  }, [isActive, cycles, sessionDuration, currentPhase, timeRemaining, pattern, patternName, saveSession, totalCycles])

  // Save session on page unload/visibility change
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isActive && cycles > 0) {
        saveSession(
          pattern,
          patternName,
          {
            cyclesCompleted: cycles,
            totalCycles: totalCycles,
            timeElapsed: sessionDuration,
            currentPhase,
            phaseTimeRemaining: timeRemaining
          },
          sessionDuration
        )
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden && isActive && cycles > 0) {
        saveSession(
          pattern,
          patternName,
          {
            cyclesCompleted: cycles,
            totalCycles: totalCycles,
            timeElapsed: sessionDuration,
            currentPhase,
            phaseTimeRemaining: timeRemaining
          },
          sessionDuration
        )
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isActive, cycles, sessionDuration, currentPhase, timeRemaining, pattern, patternName, saveSession, totalCycles])

  // Breathing cycle logic
  useEffect(() => {
    if (!isActive) return

    const runPhase = (phase: typeof currentPhase, duration: number) => {
      if (duration === 0) return Promise.resolve()
      
      return new Promise<void>((resolve) => {
        setCurrentPhase(phase)
        setTimeRemaining(duration)
        
        // Count down timer
        let remaining = duration
        const countdown = setInterval(() => {
          remaining -= 0.1
          setTimeRemaining(Math.max(0, remaining))
          
          if (remaining <= 0) {
            clearInterval(countdown)
            resolve()
          }
        }, 100)
        
        phaseTimeoutRef.current = setTimeout(() => {
          clearInterval(countdown)
          resolve()
        }, duration * 1000)
      })
    }

    const runCycle = async () => {
      await runPhase('inhale', pattern.inhale)
      if (!isActive) return
      
      await runPhase('hold', pattern.hold)
      if (!isActive) return
      
      await runPhase('exhale', pattern.exhale)
      if (!isActive) return
      
      await runPhase('pause', pattern.pause)
      if (!isActive) return
      
      setCycles(prev => prev + 1)
    }

    runCycle()

    return () => {
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current)
      }
    }
  }, [pattern, isActive, cycles])

  const toggleSession = () => {
    setIsActive(!isActive)
    if (!isActive) {
      // Reset start time when resuming
      startTimeRef.current = Date.now() - sessionDuration * 1000
    }
  }

  const handleExit = () => {
    const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000)
    
    // Clear auto-save since session is completing normally
    clearSavedSession()
    
    // Clear intervals
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current)
    }
    
    onExit({
      duration: finalDuration,
      cycles,
      pattern,
      patternName
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient that follows breathing */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial"
        animate={{
          background: currentPhase === 'inhale' ? 
            'radial-gradient(circle at center, rgba(46, 58, 240, 0.1) 0%, rgba(0, 0, 0, 0) 60%)' :
            currentPhase === 'exhale' ?
            'radial-gradient(circle at center, rgba(230, 199, 124, 0.08) 0%, rgba(0, 0, 0, 0) 60%)' :
            'radial-gradient(circle at center, rgba(116, 99, 255, 0.06) 0%, rgba(0, 0, 0, 0) 60%)'
        }}
        transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* Header with session info */}
      <motion.div 
        className="absolute top-0 left-0 right-0 pt-16 pb-4 px-6 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: showInstructions ? 0 : 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center">
          <motion.div 
            className="glass-card px-4 py-3 rounded-2xl"
            animate={{
              background: `rgba(255, 255, 255, ${isActive ? 0.05 : 0.02})`
            }}
          >
            <div className="text-white/80 font-medium tabular-nums">{formatTime(sessionDuration)}</div>
            <div className="text-xs text-white/50">{cycles} cycles</div>
          </motion.div>
          
          <motion.div 
            className="text-center glass-card px-4 py-3 rounded-2xl"
            animate={{
              background: `rgba(255, 255, 255, ${isActive ? 0.05 : 0.02})`
            }}
          >
            <div className="text-white/80 font-medium">{patternName || 'Custom'}</div>
            <div className="text-xs text-white/50">{totalCycleTime}s cycle</div>
          </motion.div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExit}
            className="p-3 text-white/40 hover:text-white/70 glass-card rounded-2xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      {/* Main breathing area */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 relative z-10">
        {/* Phase instructions */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              className="absolute top-1/3 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl mb-2 tracking-wide">
                {phaseInstructions[currentPhase]}
              </h2>
              <p className="text-white/60">Tap anywhere to pause</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Breathing orb */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          onClick={toggleSession}
        >
          <BreathingOrb 
            size="xl"
            isActive={isActive}
            phase={currentPhase}
            className="cursor-pointer"
          />
          
          {/* Phase timer ring */}
          {isActive && timeRemaining > 0 && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/20"
              style={{
                background: `conic-gradient(from 0deg, rgba(255,255,255,0.2) 0deg, rgba(255,255,255,0.2) ${((pattern[currentPhase] - timeRemaining) / pattern[currentPhase]) * 360}deg, transparent ${((pattern[currentPhase] - timeRemaining) / pattern[currentPhase]) * 360}deg)`
              }}
            />
          )}
        </motion.div>

        {/* Current phase indicator */}
        <motion.div
          className="mt-8 text-center"
          animate={{ 
            opacity: showInstructions ? 0 : 1,
            scale: isActive ? 1 : 0.9
          }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl tracking-wide capitalize mb-2">
            {phaseInstructions[currentPhase]}
          </h3>
          
          {isActive && timeRemaining > 0 && (
            <motion.div
              className="text-3xl tabular-nums text-white/80"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {Math.round(timeRemaining)}
            </motion.div>
          )}
          
          {!isActive && (
            <p className="text-white/60 text-sm mt-2">Session paused</p>
          )}
        </motion.div>

        {/* Pause/Play button when paused */}
        <AnimatePresence>
          {!isActive && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={toggleSession}
                size="lg"
                className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700"
              >
                <Play className="w-6 h-6" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gesture hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white/40 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: showInstructions ? 0 : 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <p>Swipe down to exit</p>
      </motion.div>

      {/* Swipe down to exit gesture */}
      <div
        className="absolute inset-x-0 bottom-0 h-24 cursor-pointer"
        onTouchStart={(e) => {
          const startY = e.touches[0].clientY
          const handleTouchEnd = (endEvent: TouchEvent) => {
            const endY = endEvent.changedTouches[0].clientY
            if (startY - endY < -50) { // Swipe down
              handleExit()
            }
            document.removeEventListener('touchend', handleTouchEnd)
          }
          document.addEventListener('touchend', handleTouchEnd)
        }}
        onMouseDown={(e) => {
          const startY = e.clientY
          const handleMouseUp = (endEvent: MouseEvent) => {
            const endY = endEvent.clientY
            if (endY - startY > 50) { // Swipe down
              handleExit()
            }
            document.removeEventListener('mouseup', handleMouseUp)
          }
          document.addEventListener('mouseup', handleMouseUp)
        }}
      />
    </div>
  )
}