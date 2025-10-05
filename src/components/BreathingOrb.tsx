import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

interface BreathingOrbProps {
  isActive?: boolean
  phase?: 'inhale' | 'hold' | 'exhale' | 'pause'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function BreathingOrb({ 
  isActive = false, 
  phase = 'pause', 
  size = 'lg',
  className = '' 
}: BreathingOrbProps) {
  const [gradient, setGradient] = useState('from-blue-500 to-violet-600')

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  }

  const scaleValues = {
    inhale: 1.3,
    hold: 1.3,
    exhale: 0.8,
    pause: 1
  }

  const opacityValues = {
    inhale: 1,
    hold: 0.9,
    exhale: 0.6,
    pause: 0.7
  }

  useEffect(() => {
    switch (phase) {
      case 'inhale':
        setGradient('from-blue-400 via-blue-500 to-white')
        break
      case 'hold':
        setGradient('from-white via-blue-300 to-blue-400')
        break
      case 'exhale':
        setGradient('from-amber-300 via-amber-400 to-orange-400')
        break
      case 'pause':
        setGradient('from-violet-500 via-blue-500 to-blue-600')
        break
    }
  }, [phase])

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          background: phase === 'inhale' ? 
            'radial-gradient(circle, rgba(46, 58, 240, 0.5) 0%, rgba(116, 99, 255, 0.3) 40%, transparent 70%)' :
            phase === 'exhale' ?
            'radial-gradient(circle, rgba(230, 199, 124, 0.5) 0%, rgba(255, 165, 0, 0.3) 40%, transparent 70%)' :
            'radial-gradient(circle, rgba(116, 99, 255, 0.4) 0%, rgba(46, 58, 240, 0.2) 40%, transparent 70%)'
        }}
        animate={{
          scale: isActive ? scaleValues[phase] * 1.8 : 1.2,
          opacity: isActive ? 0.8 : 0.3
        }}
        transition={{ 
          duration: 1.8, 
          ease: [0.4, 0, 0.2, 1]
        }}
      />

      {/* Secondary glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background: phase === 'inhale' ? 
            'radial-gradient(circle, rgba(46, 58, 240, 0.3) 0%, transparent 60%)' :
            phase === 'exhale' ?
            'radial-gradient(circle, rgba(230, 199, 124, 0.3) 0%, transparent 60%)' :
            'radial-gradient(circle, rgba(116, 99, 255, 0.2) 0%, transparent 60%)'
        }}
        animate={{
          scale: isActive ? scaleValues[phase] * 1.3 : 1,
          opacity: isActive ? 0.4 : 0.15
        }}
        transition={{ 
          duration: 1.5, 
          ease: [0.4, 0, 0.2, 1],
          delay: 0.1
        }}
      />

      {/* Main orb */}
      <motion.div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradient} relative overflow-hidden`}
        animate={{
          scale: isActive ? scaleValues[phase] : 1,
          opacity: isActive ? opacityValues[phase] : 0.8
        }}
        transition={{ 
          duration: 1.5, 
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        {/* Inner flowing pattern */}
        <motion.div
          className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent"
          animate={{
            rotate: isActive ? 360 : 0,
            scale: isActive ? [1, 1.1, 1] : 1
          }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
        />

        {/* Center highlight */}
        <div className="absolute top-1/4 left-1/4 w-1/3 h-1/3 rounded-full bg-white/30 blur-sm" />
      </motion.div>

      {/* Breathing rings */}
      {isActive && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border border-white/20"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-white/10"
            animate={{
              scale: [1, 2.2, 1],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </>
      )}
    </div>
  )
}