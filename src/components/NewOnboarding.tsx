import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { BreathingOrb } from './BreathingOrb'
import { AoraLogo } from './AoraLogo'

interface OnboardingProps {
  onComplete: () => void
}

export function NewOnboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [userName, setUserName] = useState('')
  const [direction, setDirection] = useState(0)

  const steps = [
    {
      id: 'welcome',
      title: 'AORA',
      subtitle: 'The Breath Between Moments',
      showLogo: true,
      showOrb: true,
      autoAdvance: true
    },
    {
      id: 'flow',
      title: 'Feel the Flow',
      subtitle: 'Haptic cues. Gentle visuals. Rhythmic calm.',
      content: 'Experience breathing guidance through gentle vibrations and luminous animations.',
      showOrb: false,
      autoAdvance: false
    },
    {
      id: 'name',
      title: 'What Should We Call You?',
      subtitle: 'Used only for greetings. Stored locally.',
      showInput: true,
      showOrb: false,
      autoAdvance: false
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1)
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Save user name if provided
    if (userName.trim()) {
      localStorage.setItem('aora-user-name', userName.trim())
    }
    onComplete()
  }

  const handleSkip = () => {
    onComplete()
  }

  // Auto-advance for welcome screen after breathing cycle
  useState(() => {
    if (currentStep === 0) {
      const timer = setTimeout(() => {
        nextStep()
      }, 6000) // One breathing cycle (~6s)
      
      return () => clearTimeout(timer)
    }
  })

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  }

  const canContinue = currentStep < 2 || (currentStep === 2 && userName.trim().length >= 1 && userName.trim().length <= 20)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress dots */}
      {currentStep > 0 && (
        <motion.div 
          className="pt-12 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center space-x-3">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 rounded-full transition-all duration-500 ${
                  index === currentStep 
                    ? 'bg-gradient-to-r from-blue-400 to-violet-500 w-8' 
                    : 'bg-white/20 w-2'
                }`}
                animate={{
                  scale: index === currentStep ? 1.1 : 1
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="flex flex-col items-center text-center space-y-8 w-full max-w-sm"
          >
            {/* Visual content */}
            <div className="h-48 flex items-center justify-center">
              {steps[currentStep].showLogo && (
                <motion.div
                  className="flex flex-col items-center space-y-6"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <AoraLogo size="xl" showText={true} animate={true} />
                </motion.div>
              )}

              {steps[currentStep].showOrb && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <BreathingOrb size="xl" isActive={true} className="aora-glow-violet" />
                  
                  {/* Breathing labels */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{
                      opacity: [0, 1, 1, 0, 0, 1]
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      times: [0, 0.25, 0.4, 0.6, 0.75, 1]
                    }}
                  >
                    <motion.span
                      className="text-sm text-white/80 font-medium tracking-wide"
                      animate={{
                        scale: [1, 1.1, 1, 1.1, 1]
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        times: [0, 0.25, 0.5, 0.75, 1]
                      }}
                    >
                      <motion.span
                        animate={{
                          opacity: [1, 1, 0, 0, 0, 1]
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          times: [0, 0.25, 0.4, 0.6, 0.75, 1]
                        }}
                      >
                        Inhale
                      </motion.span>
                      <motion.span
                        animate={{
                          opacity: [0, 0, 1, 1, 0, 0]
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          times: [0, 0.25, 0.4, 0.6, 0.75, 1]
                        }}
                      >
                        Exhale
                      </motion.span>
                    </motion.span>
                  </motion.div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div 
                  className="flex flex-col items-center space-y-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  {/* Haptic visualization */}
                  <div className="relative w-32 h-32">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border-2 border-violet-400/30"
                        animate={{
                          scale: [0.8, 1.4, 0.8],
                          opacity: [0.8, 0, 0.8]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.4,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                    <div className="absolute inset-4 rounded-full bg-gradient-to-r from-violet-400/50 to-blue-500/50 flex items-center justify-center">
                      <motion.div
                        className="w-8 h-8 rounded-full bg-white"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Text content */}
            <div className="space-y-4">
              <motion.h1 
                className="text-3xl tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {steps[currentStep].title}
              </motion.h1>
              
              <motion.p 
                className="text-lg text-amber-300/80 tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {steps[currentStep].subtitle}
              </motion.p>
              
              {steps[currentStep].content && (
                <motion.p 
                  className="text-white/60 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  {steps[currentStep].content}
                </motion.p>
              )}
            </div>

            {/* Name input */}
            {steps[currentStep].showInput && (
              <motion.div
                className="w-full space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Input
                  type="text"
                  placeholder="e.g., Aarya"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="h-14 text-center text-lg bg-white/5 border-white/20 rounded-2xl placeholder:text-white/40"
                  maxLength={20}
                  autoFocus
                />
                
                <p className="text-xs text-muted-foreground">
                  Used only for greetings. Stored locally.
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div className="p-6 pt-0">
        {currentStep === steps.length - 1 ? (
          <div className="flex space-x-4">
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="flex-1 h-14 rounded-2xl text-white/60 hover:text-white/80"
            >
              Skip
            </Button>
            <Button 
              onClick={handleComplete}
              disabled={!canContinue}
              className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 transition-all duration-300 aora-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </Button>
          </div>
        ) : currentStep > 0 ? (
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              onClick={prevStep}
              className="text-white/60 hover:text-white/80"
            >
              Back
            </Button>
            <Button 
              onClick={nextStep}
              className="bg-primary hover:bg-primary/90 px-8 rounded-xl"
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}