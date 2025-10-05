import { motion } from 'motion/react'
import { ChevronRight, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'

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

// Default exercises (locked/undeletable)
const defaultExercises: Exercise[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    tag: 'Focus',
    description: 'Equal rhythm for mental clarity',
    pattern: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: '478',
    name: '4·7·8 Breathing',
    tag: 'Sleep',
    description: 'Natural sedative for relaxation',
    pattern: { inhale: 4, hold: 7, exhale: 8, pause: 0 },
    color: 'from-violet-500 to-purple-600'
  },
  {
    id: 'coherent',
    name: 'Coherent Breathing',
    tag: 'Calm',
    description: 'Heart-brain synchronization',
    pattern: { inhale: 5, hold: 0, exhale: 5, pause: 0 },
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'resonant',
    name: 'Resonant Breathing',
    tag: 'Balance',
    description: 'Optimal breathing frequency',
    pattern: { inhale: 6, hold: 0, exhale: 6, pause: 0 },
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'triangle',
    name: 'Triangle Breathing',
    tag: 'Focus',
    description: 'Three-phase rhythm',
    pattern: { inhale: 4, hold: 4, exhale: 4, pause: 0 },
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'alternate',
    name: 'Alternate Nostril',
    tag: 'Balance',
    description: 'Channel balancing technique',
    pattern: { inhale: 4, hold: 4, exhale: 4, pause: 0 },
    color: 'from-pink-500 to-rose-600'
  }
]

interface ExerciseLibraryProps {
  onSelectExercise: (exercise: Exercise) => void
  onCreateCustom: () => void
}

export function ExerciseLibrary({ onSelectExercise, onCreateCustom }: ExerciseLibraryProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div 
        className="pt-16 pb-6 px-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl tracking-wide mb-2">Exercise Library</h1>
        <p className="text-white/60 text-sm">Choose your breathing pattern</p>
      </motion.div>

      {/* Exercise cards */}
      <div className="px-6 space-y-3">
        {exercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.6 }}
          >
            <Card 
              className="p-5 glass-card glass-card-hover cursor-pointer group relative overflow-hidden"
              onClick={() => onSelectExercise(exercise)}
            >
              {/* Subtle background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${exercise.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Enhanced color indicator with pulse */}
                  <motion.div 
                    className={`w-4 h-4 rounded-full bg-gradient-to-r ${exercise.color} relative`}
                    animate={{
                      boxShadow: [
                        `0 0 0 0 rgba(46, 58, 240, 0.3)`,
                        `0 0 0 8px rgba(46, 58, 240, 0)`,
                        `0 0 0 0 rgba(46, 58, 240, 0)`
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-lg">{exercise.name}</h3>
                      <span className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-white/10 to-white/5 text-white/80 border border-white/10">
                        {exercise.tag}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mb-3 leading-relaxed">{exercise.description}</p>
                    
                    {/* Enhanced pattern preview */}
                    <div className="flex items-center space-x-3 text-xs">
                      <div className="flex items-center space-x-1 text-blue-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span>In: {exercise.pattern.inhale}s</span>
                      </div>
                      {exercise.pattern.hold > 0 && (
                        <div className="flex items-center space-x-1 text-white/60">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                          <span>Hold: {exercise.pattern.hold}s</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1 text-amber-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>Out: {exercise.pattern.exhale}s</span>
                      </div>
                      {exercise.pattern.pause > 0 && (
                        <div className="flex items-center space-x-1 text-violet-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                          <span>Pause: {exercise.pattern.pause}s</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
                </motion.div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Create custom button */}
      <motion.div
        className="fixed bottom-28 right-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Button
          onClick={onCreateCustom}
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 shadow-2xl aora-glow group relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-full"
            animate={{
              rotate: [0, 360]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <Plus className="w-7 h-7 relative z-10 group-hover:scale-110 transition-transform duration-200" />
        </Button>
      </motion.div>
    </div>
  )
}