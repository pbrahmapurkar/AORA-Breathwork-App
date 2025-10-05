import { useState } from 'react'
import { motion } from 'motion/react'
import { CheckCircle, Edit3 } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Card } from './ui/card'
import { AoraLogo } from './AoraLogo'

interface SessionData {
  duration: number
  cycles: number
  pattern: {
    inhale: number
    hold: number
    exhale: number
    pause: number
  }
  patternName?: string
}

interface ReflectionScreenProps {
  sessionData: SessionData
  onComplete: () => void
}

export function ReflectionScreen({ sessionData, onComplete }: ReflectionScreenProps) {
  const [reflection, setReflection] = useState('')
  const [showReflectionInput, setShowReflectionInput] = useState(false)

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins}m ${secs}s`
    }
    return `${secs}s`
  }

  const handleSaveReflection = () => {
    // Save session to history
    const sessionRecord = {
      date: new Date().toISOString(),
      duration: sessionData.duration,
      exercise: sessionData.patternName || 'Custom Pattern',
      cycles: sessionData.cycles,
      pattern: sessionData.pattern,
      reflection: reflection
    }

    // Get existing session history
    const existingHistory = localStorage.getItem('aora-session-history')
    let sessionHistory = []
    
    if (existingHistory) {
      try {
        sessionHistory = JSON.parse(existingHistory)
      } catch (error) {
        console.error('Error parsing session history:', error)
      }
    }

    // Add new session and save
    sessionHistory.push(sessionRecord)
    localStorage.setItem('aora-session-history', JSON.stringify(sessionHistory))
    
    console.log('Session saved to history:', sessionRecord)
    onComplete()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background blur with logo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <AoraLogo size="xl" showText={false} className="blur-sm" />
        </motion.div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <motion.div 
          className="pt-16 pb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-4"
          >
            <CheckCircle className="w-16 h-16 mx-auto text-emerald-400 aora-glow" />
          </motion.div>
          
          <h1 className="text-2xl tracking-wide mb-2">Session Complete</h1>
          <p className="text-white/60">Well done on your practice</p>
        </motion.div>

        {/* Session stats */}
        <motion.div
          className="px-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="p-8 glass-card border-white/20 relative overflow-hidden">
            {/* Gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500" />
            
            <div className="grid grid-cols-2 gap-8">
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="text-4xl font-light tracking-wide mb-2 bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent"
                  animate={{
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {formatDuration(sessionData.duration)}
                </motion.div>
                <div className="text-sm text-white/60 uppercase tracking-wide">Duration</div>
              </motion.div>
              
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="text-4xl font-light tracking-wide mb-2 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent"
                  animate={{
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  {sessionData.cycles}
                </motion.div>
                <div className="text-sm text-white/60 uppercase tracking-wide">Cycles</div>
              </motion.div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="text-center">
                <div className="text-xl font-medium tracking-wide mb-3 text-white/90">
                  {sessionData.patternName || 'Custom Pattern'}
                </div>
                <div className="text-sm text-white/60 leading-relaxed">
                  <span className="inline-flex items-center space-x-1 mx-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>{sessionData.pattern.inhale}s in</span>
                  </span>
                  {sessionData.pattern.hold > 0 && (
                    <span className="inline-flex items-center space-x-1 mx-2">
                      <div className="w-2 h-2 rounded-full bg-white/40" />
                      <span>{sessionData.pattern.hold}s hold</span>
                    </span>
                  )}
                  <span className="inline-flex items-center space-x-1 mx-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>{sessionData.pattern.exhale}s out</span>
                  </span>
                  {sessionData.pattern.pause > 0 && (
                    <span className="inline-flex items-center space-x-1 mx-2">
                      <div className="w-2 h-2 rounded-full bg-violet-400" />
                      <span>{sessionData.pattern.pause}s pause</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Reflection section */}
        <motion.div
          className="px-6 flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {!showReflectionInput ? (
            <Card className="p-6 bg-white/[0.02] border-white/10">
              <div className="text-center space-y-4">
                <Edit3 className="w-8 h-8 mx-auto text-white/40" />
                <div>
                  <h3 className="text-lg mb-2">Add a Reflection</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    How did this session feel? What did you notice about your breath or state of mind?
                  </p>
                </div>
                <Button
                  onClick={() => setShowReflectionInput(true)}
                  variant="outline"
                  className="border-white/20 hover:bg-white/5"
                >
                  Write Reflection
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-white/[0.02] border-white/10">
              <div className="space-y-4">
                <h3 className="text-lg">Session Reflection</h3>
                <Textarea
                  placeholder="How did this session feel? What did you notice about your breath, your mind, or your body during the practice?"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="min-h-32 bg-white/5 border-white/10 focus:border-primary/50 resize-none"
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowReflectionInput(false)}
                    className="flex-1 border-white/20 hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveReflection}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700"
                    disabled={!reflection.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="p-6 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Button
            onClick={onComplete}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 aora-glow"
          >
            Continue
          </Button>
          
          <Button
            variant="ghost"
            onClick={onComplete}
            className="w-full text-white/60 hover:text-white/80"
          >
            Skip Reflection
          </Button>
        </motion.div>
      </div>
    </div>
  )
}