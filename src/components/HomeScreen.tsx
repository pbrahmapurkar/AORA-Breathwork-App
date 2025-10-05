import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { BreathingOrb } from './BreathingOrb'
import { Button } from './ui/button'
import { AoraLogo } from './AoraLogo'
import { Play, Library, CheckCircle } from 'lucide-react'

interface Exercise {
  id: string
  name: string
  tag: string
  description: string
  pattern: {
    inhale: number
    hold: number
    exhale: number
    pause: number
  }
  color: string
}

interface HomeScreenProps {
  onStartPractice: () => void
}

export function HomeScreen({ onStartPractice }: HomeScreenProps) {
  const [userName] = useState(() => localStorage.getItem('aora-user-name') || 'Friend')
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null)

  useEffect(() => {
    // Load active exercise from localStorage
    const stored = localStorage.getItem('aora-active-exercise')
    if (stored) {
      try {
        setActiveExercise(JSON.parse(stored))
      } catch (error) {
        console.error('Error parsing active exercise:', error)
      }
    }
  }, [])

  const formatPattern = (pattern: Exercise['pattern']) => {
    return `In ${pattern.inhale} • Hold ${pattern.hold} • Out ${pattern.exhale}${pattern.pause > 0 ? ` • Pause ${pattern.pause}` : ''}`
  }

  const handleStartPractice = () => {
    if (activeExercise) {
      // Start session directly with active exercise
      onStartPractice()
    } else {
      // Navigate to library to choose exercise
      onStartPractice()
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-y-auto">
      {/* Greeting Header */}
      <motion.div 
        className="pt-16 pb-6 px-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-2xl tracking-wide">
          Welcome back, {userName}.
        </h1>
      </motion.div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col px-6 space-y-8">
        {/* Active Exercise Card */}
        {activeExercise ? (
          <motion.div
            className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {/* Active indicator glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-violet-600/10 rounded-2xl"
              animate={{
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">Active</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activeExercise.tag === 'Sleep' ? 'bg-purple-500/20 text-purple-300' :
                    activeExercise.tag === 'Focus' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {activeExercise.tag}
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl mb-2">{activeExercise.name}</h3>
              
              <div className="inline-block px-4 py-2 bg-white/5 rounded-lg mb-4">
                <span className="text-sm text-muted-foreground font-mono">
                  {formatPattern(activeExercise.pattern)}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {activeExercise.description}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="glass-card rounded-2xl p-6 border-2 border-dashed border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="text-center space-y-3">
              <Library className="w-8 h-8 text-muted-foreground mx-auto" />
              <h3 className="text-lg">No Active Exercise</h3>
              <p className="text-sm text-muted-foreground">
                {userName}, pick an exercise to set as Active.
              </p>
            </div>
          </motion.div>
        )}

        {/* Central breathing orb area */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
          {/* Background breathing gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Primary CTA - Floating Start Practice Orb */}
          <motion.div
            className="relative z-10 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            <motion.button
              onClick={handleStartPractice}
              className="group relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Floating orb with breathing animation */}
              <motion.div
                className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/90 to-violet-600/90 flex items-center justify-center shadow-2xl aora-glow-violet"
                animate={{
                  scale: [1, 1.05, 1],
                  filter: [
                    'drop-shadow(0 0 25px rgba(116, 99, 255, 0.4))',
                    'drop-shadow(0 0 35px rgba(116, 99, 255, 0.6))',
                    'drop-shadow(0 0 25px rgba(116, 99, 255, 0.4))'
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Play className="w-12 h-12 text-white ml-1" />
              </motion.div>

              {/* Floating particles around orb */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-blue-400/60 rounded-full"
                  style={{
                    left: `${50 + Math.cos(i * (Math.PI / 4)) * 80}px`,
                    top: `${50 + Math.sin(i * (Math.PI / 4)) * 80}px`,
                  }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 1, 0.5],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.button>

            <motion.p
              className="text-center mt-6 text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {activeExercise ? 'Start Practice' : 'Choose an exercise to begin'}
            </motion.p>
          </motion.div>

          {/* Secondary Link - Browse Library */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Button
              variant="ghost"
              onClick={onStartPractice}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Library className="w-4 h-4 mr-2" />
              Browse Library
            </Button>
          </motion.div>
        </div>

        {/* Subtle tagline */}
        <motion.div
          className="pb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <p className="text-white/40 text-sm tracking-wide">
            The Breath Between Moments
          </p>
        </motion.div>
      </div>
    </div>
  )
}