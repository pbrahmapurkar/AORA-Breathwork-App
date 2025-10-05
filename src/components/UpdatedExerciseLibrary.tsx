import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronRight, Plus, Lock, CheckCircle, X, MoreVertical, Edit, Copy, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { toast } from 'sonner@2.0.3'

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
  isDefault?: boolean
}

// Default exercises (locked/undeletable)
const defaultExercises: Exercise[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    tag: 'Focus',
    description: 'Equal rhythm for mental clarity',
    pattern: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
    color: 'from-blue-500 to-blue-600',
    isDefault: true
  },
  {
    id: '478',
    name: '4·7·8 Breathing',
    tag: 'Sleep',
    description: 'Natural sedative for relaxation',
    pattern: { inhale: 4, hold: 7, exhale: 8, pause: 0 },
    color: 'from-violet-500 to-purple-600',
    isDefault: true
  },
  {
    id: 'coherent',
    name: 'Coherent Breathing',
    tag: 'Calm',
    description: 'Heart-brain synchronization',
    pattern: { inhale: 5, hold: 0, exhale: 5, pause: 0 },
    color: 'from-emerald-500 to-teal-600',
    isDefault: true
  },
  {
    id: 'resonant',
    name: 'Resonant Breathing',
    tag: 'Calm',
    description: 'Optimal breathing frequency',
    pattern: { inhale: 6, hold: 0, exhale: 6, pause: 0 },
    color: 'from-cyan-500 to-blue-600',
    isDefault: true
  },
  {
    id: 'triangle',
    name: 'Triangle Breathing',
    tag: 'Focus',
    description: 'Three-phase rhythm',
    pattern: { inhale: 4, hold: 4, exhale: 4, pause: 0 },
    color: 'from-indigo-500 to-purple-600',
    isDefault: true
  },
  {
    id: 'alternate',
    name: 'Alternate Nostril',
    tag: 'Balance',
    description: 'Channel balancing technique',
    pattern: { inhale: 4, hold: 4, exhale: 4, pause: 0 },
    color: 'from-pink-500 to-rose-600',
    isDefault: true
  }
]

interface ExerciseLibraryProps {
  onSelectExercise: (exercise: Exercise) => void
  onCreateCustom: () => void
}

export function UpdatedExerciseLibrary({ onSelectExercise, onCreateCustom }: ExerciseLibraryProps) {
  const [userName] = useState(() => localStorage.getItem('aora-user-name') || 'Friend')
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null)
  const [customExercises, setCustomExercises] = useState<Exercise[]>([])
  const [showGuidedBanner, setShowGuidedBanner] = useState(true)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null)

  useEffect(() => {
    // Load active exercise
    const stored = localStorage.getItem('aora-active-exercise')
    if (stored) {
      try {
        setActiveExercise(JSON.parse(stored))
        setShowGuidedBanner(false)
      } catch (error) {
        console.error('Error parsing active exercise:', error)
      }
    }

    // Load custom exercises
    const loadCustomExercises = () => {
      const customStored = localStorage.getItem('aora-custom-exercises')
      if (customStored) {
        try {
          setCustomExercises(JSON.parse(customStored))
        } catch (error) {
          console.error('Error parsing custom exercises:', error)
        }
      }
    }

    loadCustomExercises()

    // Listen for storage changes to refresh custom exercises when new ones are added
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aora-custom-exercises') {
        loadCustomExercises()
      }
    }

    // Listen for custom event to refresh custom exercises
    const handleCustomRefresh = () => {
      loadCustomExercises()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('aora-refresh-exercises', handleCustomRefresh)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('aora-refresh-exercises', handleCustomRefresh)
    }
  }, [])

  const formatPattern = (pattern: Exercise['pattern']) => {
    return `In ${pattern.inhale} • Hold ${pattern.hold} • Out ${pattern.exhale}${pattern.pause > 0 ? ` • Pause ${pattern.pause}` : ''}`
  }

  const handleSelectExercise = (exercise: Exercise) => {
    setActiveExercise(exercise)
    setShowGuidedBanner(false)
    localStorage.setItem('aora-active-exercise', JSON.stringify(exercise))
    toast(`Set Active, ${userName}.`)
    onSelectExercise(exercise)
  }

  const dismissBanner = () => {
    setShowGuidedBanner(false)
  }

  const saveCustomExercises = (exercises: Exercise[]) => {
    setCustomExercises(exercises)
    localStorage.setItem('aora-custom-exercises', JSON.stringify(exercises))
  }

  const handleDuplicateExercise = (exercise: Exercise) => {
    const duplicatedExercise: Exercise = {
      ...exercise,
      id: `custom-${Date.now()}`,
      name: `${exercise.name} (Copy)`,
      isDefault: false
    }
    const updatedCustomExercises = [...customExercises, duplicatedExercise]
    saveCustomExercises(updatedCustomExercises)
    toast(`Duplicated "${exercise.name}".`)
  }

  const handleDeleteExercise = (exercise: Exercise) => {
    if (exercise.isDefault) {
      toast.error('Cannot delete default exercises.')
      return
    }
    
    setExerciseToDelete(exercise)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteExercise = () => {
    if (!exerciseToDelete) return
    
    const updatedCustomExercises = customExercises.filter(ex => ex.id !== exerciseToDelete.id)
    saveCustomExercises(updatedCustomExercises)
    
    // If this was the active exercise, clear it
    if (activeExercise?.id === exerciseToDelete.id) {
      setActiveExercise(null)
      localStorage.removeItem('aora-active-exercise')
    }
    
    toast.success(`Deleted "${exerciseToDelete.name}".`)
    setDeleteConfirmOpen(false)
    setExerciseToDelete(null)
  }

  const handleEditExercise = (exercise: Exercise) => {
    if (exercise.isDefault) {
      toast.error('Cannot edit default exercises.')
      return
    }
    setEditingExercise(exercise)
    // For now, we'll show a toast. In a full implementation, you'd open an edit modal
    toast.info('Edit functionality will be implemented with a pattern editor.')
  }

  const ExerciseCard = ({ exercise, index }: { exercise: Exercise, index: number }) => {
    const isActive = activeExercise?.id === exercise.id

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.6 }}
      >
        <Card 
          className={`p-5 glass-card glass-card-hover cursor-pointer group relative overflow-hidden ${
            isActive ? 'border-2 border-blue-500/50 bg-blue-500/5' : ''
          }`}
          onClick={() => handleSelectExercise(exercise)}
        >
          {/* Active glow effect */}
          {isActive && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-violet-600/10 rounded-lg"
              animate={{
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
          
          {/* Subtle background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-r ${exercise.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
          
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <h3 className="font-medium text-lg">{exercise.name}</h3>
                  {exercise.isDefault && (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                  {isActive && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400 font-medium px-2 py-1 bg-green-500/20 rounded-full">
                        Active
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Menu for all exercises */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 glass-card border-white/10">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicateExercise(exercise)
                      }}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Duplicate</span>
                    </DropdownMenuItem>
                    
                    {!exercise.isDefault && (
                      <>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditExercise(exercise)
                          }}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator className="bg-white/10" />
                        
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteExercise(exercise)
                          }}
                          className="flex items-center space-x-2 text-sm text-red-400 focus:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Tag */}
              <div className={`inline-block px-3 py-1 text-xs rounded-full mb-3 ${
                exercise.tag === 'Sleep' ? 'bg-purple-500/20 text-purple-300' :
                exercise.tag === 'Focus' ? 'bg-blue-500/20 text-blue-300' :
                exercise.tag === 'Balance' ? 'bg-cyan-500/20 text-cyan-300' :
                'bg-green-500/20 text-green-300'
              }`}>
                {exercise.tag}
              </div>
              
              {/* Pattern chip */}
              <div className="inline-block px-4 py-2 bg-white/5 rounded-lg mb-3">
                <span className="text-sm text-muted-foreground font-mono">
                  {formatPattern(exercise.pattern)}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed">{exercise.description}</p>
            </div>
            
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
              className="ml-4"
            >
              <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
            </motion.div>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Header */}
      <motion.div 
        className="pt-16 pb-6 px-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl tracking-wide mb-2">Library</h1>
        <p className="text-muted-foreground text-sm">Choose your breathing pattern</p>
      </motion.div>

      {/* Guided Banner */}
      {showGuidedBanner && !activeExercise && (
        <motion.div
          className="mx-6 mb-6 p-4 glass-card rounded-2xl border border-blue-500/30 bg-blue-500/5"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-300 mb-1">
                {userName}, pick an exercise to set Active.
              </h3>
              <p className="text-xs text-muted-foreground">
                Set an active exercise to quickly start sessions from the home screen.
              </p>
            </div>
            <button
              onClick={dismissBanner}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}

      <div className="px-6 space-y-8 pb-32">
        {/* Default Exercises Section */}
        <div>
          <motion.h2 
            className="text-lg font-medium mb-4 flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Lock className="w-5 h-5 text-muted-foreground" />
            <span>Default Exercises</span>
          </motion.h2>
          
          <div className="space-y-3">
            {defaultExercises.map((exercise, index) => (
              <ExerciseCard key={exercise.id} exercise={exercise} index={index} />
            ))}
          </div>
        </div>

        {/* Custom Exercises Section */}
        {customExercises.length > 0 && (
          <div>
            <motion.h2 
              className="text-lg font-medium mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              My Exercises
            </motion.h2>
            
            <div className="space-y-3">
              {customExercises.map((exercise, index) => (
                <ExerciseCard key={exercise.id} exercise={exercise} index={index + defaultExercises.length} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAB - Create Exercise */}
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
            className="relative z-10"
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Plus className="w-8 h-8 text-white" />
          </motion.div>
          
          {/* Floating particles around FAB */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/60 rounded-full"
              style={{
                left: `${50 + Math.cos(i * (Math.PI / 3)) * 30}px`,
                top: `${50 + Math.sin(i * (Math.PI / 3)) * 30}px`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0.5, 1, 0.5],
                rotate: [0, 360]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </Button>
        
        <motion.p
          className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
          initial={false}
        >
          Create Exercise
        </motion.p>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="glass-card border-red-500/30 bg-background/95">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{exerciseToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setDeleteConfirmOpen(false)
                setExerciseToDelete(null)
              }}
              className="border-white/20 hover:bg-white/5"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteExercise}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}