import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Vibrate, Volume2, Moon, Sun, RotateCcw, Info, Shield } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Switch } from './ui/switch'
import { Separator } from './ui/separator'
import { AoraLogo } from './AoraLogo'
import { NotificationManager } from './NotificationManager'

interface SettingsProps {
  onBack: () => void
  onReplayIntro: () => void
}

export function SettingsScreen({ onBack, onReplayIntro }: SettingsProps) {
  const [haptics, setHaptics] = useState(true)
  const [sound, setSound] = useState(false)
  const [darkTheme, setDarkTheme] = useState(true)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedHaptics = localStorage.getItem('aora-haptics')
    const savedSound = localStorage.getItem('aora-sound')
    const savedTheme = localStorage.getItem('aora-theme')

    if (savedHaptics !== null) setHaptics(JSON.parse(savedHaptics))
    if (savedSound !== null) setSound(JSON.parse(savedSound))
    if (savedTheme !== null) setDarkTheme(savedTheme === 'dark')
  }, [])

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('aora-haptics', JSON.stringify(haptics))
  }, [haptics])

  useEffect(() => {
    localStorage.setItem('aora-sound', JSON.stringify(sound))
  }, [sound])

  useEffect(() => {
    localStorage.setItem('aora-theme', darkTheme ? 'dark' : 'light')
    // Toggle dark class on document
    if (darkTheme) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkTheme])

  const settingsOptions = [
    {
      icon: Vibrate,
      title: 'Haptic Feedback',
      description: 'Feel the rhythm through gentle vibrations',
      value: haptics,
      onChange: setHaptics
    },
    {
      icon: Volume2,
      title: 'Sound Cues',
      description: 'Audio guidance for breath phases',
      value: sound,
      onChange: setSound
    },
    {
      icon: darkTheme ? Moon : Sun,
      title: 'Dark Theme',
      description: 'Toggle between light and dark appearance',
      value: darkTheme,
      onChange: setDarkTheme
    }
  ]

  const actionItems = [
    {
      icon: RotateCcw,
      title: 'Replay Introduction',
      description: 'View the onboarding flow again',
      action: onReplayIntro
    },
    {
      icon: Info,
      title: 'About AORA',
      description: 'Version 1.0 • The Breath Between Moments',
      action: () => console.log('About AORA')
    },
    {
      icon: Shield,
      title: 'Privacy Policy',
      description: 'How we protect your data',
      action: () => console.log('Privacy Policy')
    }
  ]

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between pt-16 pb-6 px-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <h1 className="text-xl tracking-wide">Settings</h1>
        
        <div className="w-9" /> {/* Spacer */}
      </motion.div>

      <div className="px-6 space-y-6">
        {/* Settings toggles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <Card className="p-8 glass-card border-white/20 space-y-8">
            {settingsOptions.map((option, index) => (
              <div key={option.title}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    <motion.div 
                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <option.icon className="w-6 h-6 text-white/80" />
                    </motion.div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-lg text-white/90">{option.title}</h3>
                      <p className="text-sm text-white/60 mt-1 leading-relaxed">{option.description}</p>
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Switch
                      checked={option.value}
                      onCheckedChange={option.onChange}
                    />
                  </motion.div>
                </div>
                
                {index < settingsOptions.length - 1 && (
                  <Separator className="mt-8 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                )}
              </div>
            ))}
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <NotificationManager />
        </motion.div>

        {/* Action items */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {actionItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
            >
              <Card 
                className="p-4 bg-white/[0.02] border-white/10 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer"
                onClick={item.action}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-white/70" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-white/60 mt-1">{item.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* App info */}
        <motion.div
          className="pt-8 pb-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="space-y-6">
            <motion.div
              animate={{
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <AoraLogo size="md" showText={true} className="opacity-60" />
            </motion.div>
            
            <div className="space-y-2 text-white/40">
              <div className="text-xs tracking-wide">
                Version 1.0.0 • The Breath Between Moments
              </div>
              <div className="text-xs">
                <span className="inline-block mx-2">Luminous</span>
                <span className="text-white/20">•</span>
                <span className="inline-block mx-2">Minimal</span>
                <span className="text-white/20">•</span>
                <span className="inline-block mx-2">Alive</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}