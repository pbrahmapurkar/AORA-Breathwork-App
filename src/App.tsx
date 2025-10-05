import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { NewOnboarding } from './components/NewOnboarding'
import { HomeScreen } from './components/HomeScreen'
import { UpdatedExerciseLibrary } from './components/UpdatedExerciseLibrary'
import { ControlPanel } from './components/ControlPanel'
import { SessionScreen } from './components/SessionScreen'
import { ReflectionScreen } from './components/ReflectionScreen'
import { ProgressDashboard } from './components/ProgressDashboard'
import { SettingsScreen } from './components/SettingsScreen'
import { Navigation } from './components/Navigation'
import { LoadingScreen } from './components/LoadingScreen'
import { SessionAutoSave } from './components/SessionAutoSave'
import { Toaster } from './components/ui/sonner'

interface BreathPattern {
  inhale: number
  hold: number
  exhale: number
  pause: number
}

interface Exercise {
  id: string
  name: string
  tag: string
  description: string
  pattern: BreathPattern
  color: string
}

interface SessionData {
  duration: number
  cycles: number
  pattern: BreathPattern
  patternName?: string
}

interface SavedSession {
  id: string
  timestamp: number
  pattern: BreathPattern
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

type AppScreen = 
  | 'onboarding'
  | 'home'
  | 'library'
  | 'custom'
  | 'control'
  | 'session'
  | 'reflection'
  | 'progress'
  | 'settings'

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('onboarding')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [customPattern, setCustomPattern] = useState<BreathPattern | null>(null)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [showSavedSessionPrompt, setShowSavedSessionPrompt] = useState(false)

  // Check if user has completed onboarding and if there's a saved session
  useEffect(() => {
    const completed = localStorage.getItem('aora-onboarding-completed')
    if (completed === 'true') {
      setHasCompletedOnboarding(true)
      setCurrentScreen('home')
      
      // Check for saved session after a brief delay
      setTimeout(() => {
        const savedSession = localStorage.getItem('aora-saved-session')
        if (savedSession) {
          try {
            const session = JSON.parse(savedSession)
            const hoursSinceLastSession = (Date.now() - session.timestamp) / (1000 * 60 * 60)
            if (hoursSinceLastSession < 24) {
              setShowSavedSessionPrompt(true)
            }
          } catch (error) {
            console.error('Error parsing saved session:', error)
          }
        }
      }, 1000)
    }
  }, [])

  // Apply dark theme by default
  useEffect(() => {
    const savedTheme = localStorage.getItem('aora-theme')
    if (!savedTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('aora-theme', 'dark')
    } else if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const handleOnboardingComplete = () => {
    localStorage.setItem('aora-onboarding-completed', 'true')
    setHasCompletedOnboarding(true)
    navigateToScreen('home', 'Welcome to AORA')
  }

  // Unified navigation function with loading states
  const navigateToScreen = (screen: AppScreen, message?: string) => {
    setIsLoading(true)
    setLoadingMessage(message || 'Loading...')
    
    setTimeout(() => {
      setCurrentScreen(screen)
      setIsLoading(false)
      setLoadingMessage('')
    }, 300) // Brief loading delay for smooth transitions
  }

  const handleStartPractice = () => {
    navigateToScreen('library', 'Loading exercises...')
  }

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    navigateToScreen('control', 'Preparing session...')
  }

  const handleCreateCustom = () => {
    setSelectedExercise(null)
    setCustomPattern({ inhale: 4, hold: 4, exhale: 4, pause: 4 })
    navigateToScreen('control', 'Creating custom pattern...')
  }

  const handleStartSession = (pattern: BreathPattern, patternName?: string) => {
    setCustomPattern(pattern)
    navigateToScreen('session', 'Starting your practice...')
  }

  const handleSessionComplete = (data: SessionData) => {
    setSessionData(data)
    // Clear any saved session when completing normally
    localStorage.removeItem('aora-saved-session')
    navigateToScreen('reflection', 'Processing your session...')
  }

  const handleReflectionComplete = () => {
    setSelectedExercise(null)
    setCustomPattern(null)
    setSessionData(null)
    navigateToScreen('home', 'Returning home...')
  }

  const handleNavigation = (screen: string) => {
    if (screen === 'custom') {
      handleCreateCustom()
    } else {
      navigateToScreen(screen as AppScreen)
    }
  }

  const handleReplayIntro = () => {
    navigateToScreen('onboarding', 'Loading introduction...')
  }

  // Handle resuming saved session
  const handleResumeSession = (savedSession: SavedSession) => {
    setCustomPattern(savedSession.pattern)
    setSelectedExercise(savedSession.patternName ? {
      id: 'saved',
      name: savedSession.patternName,
      tag: 'Resumed',
      description: 'Continuing your previous session',
      pattern: savedSession.pattern,
      color: '#2E3AF0'
    } : null)
    setShowSavedSessionPrompt(false)
    navigateToScreen('session', 'Resuming your session...')
  }

  const handleDismissSavedSession = () => {
    setShowSavedSessionPrompt(false)
    localStorage.removeItem('aora-saved-session')
  }

  const showNavigation = hasCompletedOnboarding && 
    !['onboarding', 'control', 'session', 'reflection'].includes(currentScreen)

  return (
    <div className="size-full min-h-screen bg-background text-foreground overflow-x-hidden overflow-y-auto touch-pan-y">
      {/* Loading Screen */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen key="loading" message={loadingMessage} />
        )}
      </AnimatePresence>

      {/* Saved Session Prompt */}
      <AnimatePresence>
        {showSavedSessionPrompt && (
          <SessionAutoSave
            key="saved-session"
            onResumeSession={handleResumeSession}
            onDismiss={handleDismissSavedSession}
          />
        )}
      </AnimatePresence>

      {/* Screen transitions */}
      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="size-full"
          >
        {currentScreen === 'onboarding' && (
          <NewOnboarding onComplete={handleOnboardingComplete} />
        )}

        {currentScreen === 'home' && (
          <HomeScreen onStartPractice={handleStartPractice} />
        )}

        {currentScreen === 'library' && (
          <UpdatedExerciseLibrary 
            onSelectExercise={handleSelectExercise}
            onCreateCustom={handleCreateCustom}
          />
        )}

        {currentScreen === 'control' && (
          <ControlPanel
            onBack={() => navigateToScreen('library', 'Loading exercises...')}
            onStartSession={handleStartSession}
            onSavePreset={() => navigateToScreen('library', 'Returning to library...')}
            initialPattern={selectedExercise?.pattern || customPattern || undefined}
            presetName={selectedExercise?.name}
          />
        )}

        {currentScreen === 'session' && customPattern && (
          <SessionScreen
            pattern={customPattern}
            patternName={selectedExercise?.name}
            onExit={handleSessionComplete}
          />
        )}

        {currentScreen === 'reflection' && sessionData && (
          <ReflectionScreen
            sessionData={sessionData}
            onComplete={handleReflectionComplete}
          />
        )}

        {currentScreen === 'progress' && (
          <ProgressDashboard
            onStartPractice={handleStartPractice}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            onBack={() => navigateToScreen('home', 'Returning home...')}
            onReplayIntro={handleReplayIntro}
          />
        )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom navigation */}
      {showNavigation && (
        <Navigation
          currentScreen={currentScreen}
          onNavigate={handleNavigation}
        />
      )}

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'rgba(12, 13, 16, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            backdropFilter: 'blur(20px)'
          }
        }}
      />
    </div>
  )
}