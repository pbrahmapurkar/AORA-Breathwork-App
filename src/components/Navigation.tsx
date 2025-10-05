import { motion } from 'motion/react'
import { Home, Library, BarChart3, Settings } from 'lucide-react'

interface NavigationProps {
  currentScreen: string
  onNavigate: (screen: string) => void
}

export function Navigation({ currentScreen, onNavigate }: NavigationProps) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'library', icon: Library, label: 'Library' },
    { id: 'progress', icon: BarChart3, label: 'Progress' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ]

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/20 px-6 py-5 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {/* Subtle top accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center space-y-2 py-3 px-4 rounded-2xl relative group"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-violet-500/15 to-blue-500/20 rounded-2xl border border-white/10"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              {/* Hover effect */}
              {!isActive && (
                <motion.div
                  className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.2 }}
                />
              )}
              
              {/* Icon */}
              <motion.div
                className="relative z-10"
                animate={{
                  scale: isActive ? 1.15 : 1,
                  color: isActive ? '#2E3AF0' : 'rgba(255, 255, 255, 0.6)'
                }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
              >
                <item.icon className="w-6 h-6" />
                
                {/* Active glow */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-blue-500/30 rounded-full blur-md"
                    animate={{
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
              
              {/* Label */}
              <motion.span
                className="text-xs tracking-wide font-medium relative z-10"
                animate={{
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                  opacity: isActive ? 1 : 0.8
                }}
                transition={{ duration: 0.2 }}
              >
                {item.label}
              </motion.span>
              
              {/* Active indicator line */}
              {isActive && (
                <motion.div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-violet-500 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}