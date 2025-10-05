import { motion } from 'motion/react'
import logoImage from 'figma:asset/39ef3770f62e199ed3c5524c704bce5e096fc753.png'

interface AoraLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
  animate?: boolean
}

export function AoraLogo({ 
  size = 'md', 
  showText = true, 
  className = '',
  animate = false 
}: AoraLogoProps) {
  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  }

  const textSizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  }

  const LogoImage = animate ? motion.img : 'img'
  const LogoText = animate ? motion.div : 'div'

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <LogoImage
        src={logoImage}
        alt="AORA Logo"
        className={`${sizeClasses[size]} object-contain aora-glow-violet`}
        {...(animate && {
          animate: {
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          },
          transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }
        })}
      />
      
      {showText && (
        <LogoText
          className={`${textSizeClasses[size]} tracking-[0.3em] bg-gradient-to-r from-white via-blue-100 to-violet-200 bg-clip-text text-transparent font-light`}
          {...(animate && {
            animate: {
              opacity: [0.8, 1, 0.8]
            },
            transition: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }
          })}
        >
          AORA
        </LogoText>
      )}
    </div>
  )
}