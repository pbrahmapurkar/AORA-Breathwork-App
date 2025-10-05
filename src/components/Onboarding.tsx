import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'
import { BreathingOrb } from './BreathingOrb'
import { AoraLogo } from './AoraLogo'

interface OnboardingProps {
  onComplete: () => void
}

const slides = [
  {
    title: 'AORA',
    subtitle: 'The Breath Between Moments',
    content: 'Welcome to your next-generation breathwork companion.',
    visual: 'logo'
  },
  {
    title: 'Precision Instrument',
    subtitle: 'Control your state through rhythm',
    content: 'Fine-tune your breath patterns with scientific precision.',
    visual: 'waveform'
  },
  {
    title: 'Minimal. Silent. Yours.',
    subtitle: 'Design for presence',
    content: 'No distractions. No noise. Pure focus on your breath.',
    visual: 'wireframe'
  },
  {
    title: 'Feel the Flow',
    subtitle: 'Guided by haptic breath',
    content: 'Let gentle vibrations guide your natural rhythm.',
    visual: 'ripple'
  },
  {
    title: 'Begin',
    subtitle: 'Your journey starts now',
    content: 'Ready to discover the power of conscious breathing?',
    visual: 'orb'
  }
]

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1)
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setDirection(-1)
      setCurrentSlide(currentSlide - 1)
    }
  }

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

  const renderVisual = (visual: string) => {
    switch (visual) {
      case 'logo':
        return (
          <motion.div 
            className="flex flex-col items-center space-y-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <AoraLogo size="xl" showText={true} animate={true} />
            <motion.div
              className="w-2 h-2 bg-gradient-to-r from-blue-400 to-violet-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )
      
      case 'waveform':
        return (
          <motion.div className="flex items-center justify-center h-32">
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 mx-1 bg-gradient-to-t from-blue-500 to-violet-400 rounded-full"
                style={{ height: `${20 + Math.sin(i * 0.5) * 30}px` }}
                animate={{
                  height: [
                    `${20 + Math.sin(i * 0.5) * 30}px`,
                    `${40 + Math.sin(i * 0.5) * 50}px`,
                    `${20 + Math.sin(i * 0.5) * 30}px`
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        )
      
      case 'wireframe':
        return (
          <motion.div 
            className="relative w-48 h-48 border border-white/20 rounded-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.div 
              className="absolute inset-4 border border-white/10 rounded"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div 
              className="absolute inset-8 border border-white/5 rounded"
              animate={{ opacity: [0.1, 0.5, 0.1] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            />
          </motion.div>
        )
      
      case 'ripple':
        return (
          <motion.div className="relative w-48 h-48 flex items-center justify-center">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-full h-full rounded-full border border-violet-400/30"
                animate={{
                  scale: [0.5, 1.5, 0.5],
                  opacity: [0.8, 0, 0.8]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeInOut"
                }}
              />
            ))}
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-400 to-blue-500" />
          </motion.div>
        )
      
      case 'orb':
        return <BreathingOrb size="xl" isActive={true} className="aora-glow-violet" />
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with progress */}
      <div className="pt-12 pb-8 px-6">
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-3 rounded-full glass-card glass-card-hover disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex space-x-3">
            {slides.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 rounded-full transition-all duration-500 ${
                  index === currentSlide 
                    ? 'bg-gradient-to-r from-blue-400 to-violet-500 w-8' 
                    : 'bg-white/20 w-2'
                }`}
                animate={{
                  scale: index === currentSlide ? 1.1 : 1
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="p-3 rounded-full glass-card glass-card-hover disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
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
            {/* Visual */}
            <div className="h-48 flex items-center justify-center">
              {renderVisual(slides[currentSlide].visual)}
            </div>

            {/* Text content */}
            <div className="space-y-4">
              <motion.h1 
                className="text-3xl tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {slides[currentSlide].title}
              </motion.h1>
              
              <motion.p 
                className="text-lg text-amber-300/80 tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {slides[currentSlide].subtitle}
              </motion.p>
              
              <motion.p 
                className="text-white/60 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {slides[currentSlide].content}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action */}
      <div className="p-6 pt-0">
        {currentSlide === slides.length - 1 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Button 
              onClick={onComplete}
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 transition-all duration-300 aora-glow text-lg font-medium tracking-wide shadow-2xl"
            >
              <motion.span
                animate={{ opacity: [1, 0.8, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Start Breathing
              </motion.span>
            </Button>
          </motion.div>
        ) : (
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              onClick={onComplete}
              className="text-white/40 hover:text-white/60"
            >
              Skip
            </Button>
            <Button 
              onClick={nextSlide}
              className="bg-primary hover:bg-primary/90 px-8 rounded-xl"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}