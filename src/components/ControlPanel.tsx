import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Play, Save } from 'lucide-react'
import { Button } from './ui/button'
import { CustomSlider } from './CustomSlider'
import { BreathingOrb } from './BreathingOrb'
import { Input } from './ui/input'
import { toast } from 'sonner@2.0.3'

interface BreathPattern {
  inhale: number
  hold: number
  exhale: number
  pause: number
}

interface ControlPanelProps {
  onBack: () => void
  onStartSession: (pattern: BreathPattern, name?: string) => void
  onSavePreset?: (pattern: BreathPattern, name: string) => void
  initialPattern?: BreathPattern
  presetName?: string
}

export function ControlPanel({ 
  onBack, 
  onStartSession, 
  onSavePreset,
  initialPattern,
  presetName
}: ControlPanelProps) {
  const [pattern, setPattern] = useState<BreathPattern>(
    initialPattern || { inhale: 4, hold: 4, exhale: 4, pause: 4 }
  )
  const [customName, setCustomName] = useState('')
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale')
  const [isPreviewActive, setIsPreviewActive] = useState(false)

  // Live preview animation
  useEffect(() => {
    if (!isPreviewActive) return

    const totalDuration = (pattern.inhale + pattern.hold + pattern.exhale + pattern.pause) * 1000
    let timeouts: NodeJS.Timeout[] = []

    const runCycle = () => {
      setCurrentPhase('inhale')
      
      timeouts.push(setTimeout(() => setCurrentPhase('hold'), pattern.inhale * 1000))
      timeouts.push(setTimeout(() => setCurrentPhase('exhale'), (pattern.inhale + pattern.hold) * 1000))
      timeouts.push(setTimeout(() => setCurrentPhase('pause'), (pattern.inhale + pattern.hold + pattern.exhale) * 1000))
    }

    runCycle()
    const interval = setInterval(runCycle, totalDuration)

    return () => {
      clearInterval(interval)
      timeouts.forEach(clearTimeout)
    }
  }, [pattern, isPreviewActive])

  const updatePattern = (key: keyof BreathPattern, value: number) => {
    setPattern(prev => ({ ...prev, [key]: value }))
  }

  const handleSavePreset = () => {
    const name = customName.trim() || `Custom ${Date.now()}`
    
    // Create new custom exercise
    const newExercise = {
      id: `custom-${Date.now()}`,
      name,
      tag: 'Custom',
      description: 'Custom breathing pattern',
      pattern,
      color: 'from-indigo-500 to-purple-600',
      isDefault: false
    }
    
    // Save to localStorage
    const existingCustomExercises = JSON.parse(localStorage.getItem('aora-custom-exercises') || '[]')
    const updatedCustomExercises = [...existingCustomExercises, newExercise]
    localStorage.setItem('aora-custom-exercises', JSON.stringify(updatedCustomExercises))
    
    // Dispatch custom event to refresh exercise library
    window.dispatchEvent(new CustomEvent('aora-refresh-exercises'))
    
    // Show success toast
    toast.success(`Saved "${name}" to your library.`)
    
    // Call the save callback if provided, otherwise go back to library
    if (onSavePreset) {
      onSavePreset(pattern, name)
    } else {
      onBack()
    }
  }

  const totalCycleTime = pattern.inhale + pattern.hold + pattern.exhale + pattern.pause

  return (
    <div className="min-h-screen bg-background">
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
        
        <div className="text-center">
          <h1 className="text-xl">
            {presetName || 'Custom Pattern'}
          </h1>
          <p className="text-sm text-white/60">
            {Math.round(totalCycleTime)}s cycle
          </p>
        </div>
        
        <div className="w-9" /> {/* Spacer */}
      </motion.div>

      {/* Live preview orb */}
      <motion.div
        className="flex justify-center py-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="relative">
          <BreathingOrb 
            size="lg" 
            isActive={isPreviewActive}
            phase={currentPhase}
            className="aora-glow"
          />
          
          {/* Phase indicator - positioned to avoid overlap */}
          <motion.div
            className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center w-full"
            animate={{ opacity: isPreviewActive ? 1 : 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="px-4 py-2 rounded-full glass-card text-sm capitalize tracking-wide mx-auto w-fit"
              animate={{
                scale: isPreviewActive ? [1, 1.05, 1] : 1,
                background: isPreviewActive 
                  ? `rgba(${currentPhase === 'inhale' ? '46, 58, 240' : currentPhase === 'exhale' ? '230, 199, 124' : '116, 99, 255'}, 0.1)`
                  : 'rgba(255, 255, 255, 0.02)'
              }}
              transition={{ duration: 1.5 }}
            >
              {isPreviewActive ? currentPhase : 'preview'}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Preview toggle - increased spacing to prevent overlap */}
      <motion.div
        className="flex justify-center pb-8 pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Button
          variant={isPreviewActive ? "secondary" : "outline"}
          onClick={() => setIsPreviewActive(!isPreviewActive)}
          className="px-8 py-3 rounded-2xl glass-card glass-card-hover border-white/20 font-medium tracking-wide group"
        >
          <motion.span
            animate={{
              color: isPreviewActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'
            }}
            className="flex items-center space-x-2"
          >
            <motion.div
              className={`w-2 h-2 rounded-full ${isPreviewActive ? 'bg-green-400' : 'bg-white/40'}`}
              animate={{
                scale: isPreviewActive ? [1, 1.2, 1] : 1,
                opacity: isPreviewActive ? [1, 0.6, 1] : 1
              }}
              transition={{ duration: 1, repeat: isPreviewActive ? Infinity : 0 }}
            />
            <span>{isPreviewActive ? 'Stop Preview' : 'Live Preview'}</span>
          </motion.span>
        </Button>
      </motion.div>

      {/* Control sliders */}
      <div className="px-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <CustomSlider
            label="Inhale"
            value={pattern.inhale}
            onChange={(value) => updatePattern('inhale', value)}
            min={1}
            max={12}
            step={0.5}
            color="from-blue-400 to-blue-600"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <CustomSlider
            label="Hold"
            value={pattern.hold}
            onChange={(value) => updatePattern('hold', value)}
            min={0}
            max={15}
            step={0.5}
            color="from-white to-blue-300"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <CustomSlider
            label="Exhale"
            value={pattern.exhale}
            onChange={(value) => updatePattern('exhale', value)}
            min={1}
            max={15}
            step={0.5}
            color="from-amber-400 to-orange-500"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <CustomSlider
            label="Pause"
            value={pattern.pause}
            onChange={(value) => updatePattern('pause', value)}
            min={0}
            max={10}
            step={0.5}
            color="from-violet-400 to-purple-600"
          />
        </motion.div>

        {/* Custom name input - Enhanced UI/UX */}
        {!presetName && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <div className="space-y-1">
              <label className="text-sm text-white/80 tracking-wide flex items-center justify-between">
                <span>Pattern Name</span>
                <span className="text-xs text-white/40">{customName.length}/30</span>
              </label>
              <p className="text-xs text-white/50">
                Give your breathing pattern a memorable name
              </p>
            </div>
            <div className="relative">
              <Input
                placeholder="e.g., Morning Focus, Deep Relax..."
                value={customName}
                onChange={(e) => {
                  const value = e.target.value
                  if (value.length <= 30) {
                    setCustomName(value)
                  }
                }}
                maxLength={30}
                className="bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/8 rounded-xl px-4 py-3 placeholder:text-white/30 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:ring-offset-0"
              />
              {customName && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </motion.div>
              )}
            </div>
            {customName.length === 30 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-amber-400 flex items-center space-x-1"
              >
                <span>⚠️</span>
                <span>Character limit reached</span>
              </motion.p>
            )}
          </motion.div>
        )}
      </div>

      {/* Action buttons */}
      <motion.div
        className="flex gap-3 p-6 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {!presetName && (
          <Button
            variant="outline"
            onClick={handleSavePreset}
            className="flex-1 h-12 rounded-xl border-white/20 hover:bg-white/5"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Preset
          </Button>
        )}
        
        <Button
          onClick={() => onStartSession(pattern, presetName)}
          className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 aora-glow"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Session
        </Button>
      </motion.div>
    </div>
  )
}