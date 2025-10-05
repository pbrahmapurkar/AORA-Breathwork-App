import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Play, RotateCcw, X, Clock, Target } from 'lucide-react'

interface SavedSession {
  id: string
  timestamp: number
  pattern: {
    inhale: number
    hold: number
    exhale: number
    pause: number
  }
  patternName?: string
  progress: {
    cyclesCompleted: number
    totalCycles: number
    timeElapsed: number
    currentPhase: 'inhale' | 'hold' | 'exhale' | 'pause'
    phaseTimeRemaining: number
  }
  duration: number
}

interface SessionAutoSaveProps {
  onResumeSession?: (savedSession: SavedSession) => void
  onDismiss?: () => void
}

export function SessionAutoSave({ onResumeSession, onDismiss }: SessionAutoSaveProps) {
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    checkForSavedSession()
  }, [])

  const checkForSavedSession = () => {
    const saved = localStorage.getItem('aora-saved-session')
    if (saved) {
      try {
        const session = JSON.parse(saved) as SavedSession
        // Only show if session was saved less than 24 hours ago
        const hoursSinceLastSession = (Date.now() - session.timestamp) / (1000 * 60 * 60)
        if (hoursSinceLastSession < 24) {
          setSavedSession(session)
          setShowPrompt(true)
        } else {
          // Clean up old saved session
          clearSavedSession()
        }
      } catch (error) {
        console.error('Error parsing saved session:', error)
        clearSavedSession()
      }
    }
  }

  const handleResumeSession = () => {
    if (savedSession && onResumeSession) {
      onResumeSession(savedSession)
      clearSavedSession()
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    clearSavedSession()
    setShowPrompt(false)
    onDismiss?.()
  }

  const clearSavedSession = () => {
    localStorage.removeItem('aora-saved-session')
    setSavedSession(null)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimeSince = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`
    } else if (minutes > 0) {
      return `${minutes}m ago`
    } else {
      return 'Just now'
    }
  }

  if (!showPrompt || !savedSession) {
    return null
  }

  const completionPercentage = Math.round(
    (savedSession.progress.cyclesCompleted / savedSession.progress.totalCycles) * 100
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-x-4 top-4 z-50 mx-auto max-w-md"
    >
      <Card className="glass-card border-primary/20 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <RotateCcw className="w-5 h-5 text-primary" />
                Resume Session
              </CardTitle>
              <CardDescription>
                Continue your interrupted breathing session
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground -mt-1 -mr-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Session Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pattern</span>
              <span className="font-medium">
                {savedSession.patternName || 'Custom Pattern'}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {savedSession.progress.cyclesCompleted} / {savedSession.progress.totalCycles} cycles ({completionPercentage}%)
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Time Elapsed</span>
              <span className="font-medium">
                {formatTime(savedSession.progress.timeElapsed)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Active</span>
              <span className="font-medium">
                {formatTimeSince(savedSession.timestamp)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Session Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary to-chart-2 rounded-full"
              />
            </div>
          </div>

          {/* Pattern Preview */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-primary" />
                <span className="text-muted-foreground">Pattern:</span>
              </div>
              <div className="flex gap-2">
                <span>{savedSession.pattern.inhale}s</span>
                <span className="text-muted-foreground">•</span>
                <span>{savedSession.pattern.hold}s</span>
                <span className="text-muted-foreground">•</span>
                <span>{savedSession.pattern.exhale}s</span>
                <span className="text-muted-foreground">•</span>
                <span>{savedSession.pattern.pause}s</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleResumeSession}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Play className="w-4 h-4 mr-2" />
              Resume Session
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1"
            >
              Start Fresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Hook for auto-saving session progress
export function useSessionAutoSave() {
  const saveSession = (
    pattern: SavedSession['pattern'],
    patternName: string | undefined,
    progress: SavedSession['progress'],
    duration: number
  ) => {
    const sessionData: SavedSession = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      pattern,
      patternName,
      progress,
      duration
    }

    localStorage.setItem('aora-saved-session', JSON.stringify(sessionData))
  }

  const clearSavedSession = () => {
    localStorage.removeItem('aora-saved-session')
  }

  const getSavedSession = (): SavedSession | null => {
    const saved = localStorage.getItem('aora-saved-session')
    if (saved) {
      try {
        return JSON.parse(saved) as SavedSession
      } catch (error) {
        console.error('Error parsing saved session:', error)
        clearSavedSession()
        return null
      }
    }
    return null
  }

  // Auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // This will be handled by the SessionScreen component
      // when it detects the session is active
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Session might be interrupted, let SessionScreen handle saving
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return {
    saveSession,
    clearSavedSession,
    getSavedSession
  }
}