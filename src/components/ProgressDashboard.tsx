import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Flame, Target, TrendingUp, BarChart3 } from 'lucide-react'
import { Button } from './ui/button'
import { Progress } from './ui/progress'

interface SessionRecord {
  date: string
  duration: number
  exercise: string
  cycles: number
}

interface ProgressDashboardProps {
  onStartPractice: () => void
}

export function ProgressDashboard({ onStartPractice }: ProgressDashboardProps) {
  const [userName] = useState(() => localStorage.getItem('aora-user-name') || 'Friend')
  const [sessions, setSessions] = useState<SessionRecord[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [todayMinutes, setTodayMinutes] = useState(0)
  const [todaySessions, setTodaySessions] = useState(0)
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  const [mostUsedTechnique, setMostUsedTechnique] = useState<{ name: string, percentage: number } | null>(null)

  // Daily goals
  const dailyMinutesGoal = 15
  const dailySessionsGoal = 3

  useEffect(() => {
    // Load session data from localStorage
    const storedSessions = localStorage.getItem('aora-session-history')
    if (storedSessions) {
      try {
        const parsedSessions: SessionRecord[] = JSON.parse(storedSessions)
        setSessions(parsedSessions)
        calculateStats(parsedSessions)
      } catch (error) {
        console.error('Error parsing session history:', error)
      }
    }
  }, [])

  const calculateStats = (sessionData: SessionRecord[]) => {
    const today = new Date().toDateString()
    const todaysSessions = sessionData.filter(session => 
      new Date(session.date).toDateString() === today
    )

    // Calculate today's stats
    const totalMinutesToday = todaysSessions.reduce((total, session) => total + session.duration, 0)
    setTodayMinutes(Math.round(totalMinutesToday / 60))
    setTodaySessions(todaysSessions.length)

    // Calculate streak
    calculateStreak(sessionData)

    // Calculate weekly data
    calculateWeeklyData(sessionData)

    // Calculate most used technique
    calculateMostUsedTechnique(sessionData)
  }

  const calculateStreak = (sessionData: SessionRecord[]) => {
    if (sessionData.length === 0) {
      setCurrentStreak(0)
      return
    }

    // Group sessions by date
    const sessionsByDate = sessionData.reduce((acc, session) => {
      const date = new Date(session.date).toDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(session)
      return acc
    }, {} as Record<string, SessionRecord[]>)

    // Calculate consecutive days with sessions
    let streak = 0
    let currentDate = new Date()
    
    while (true) {
      const dateString = currentDate.toDateString()
      if (sessionsByDate[dateString] && sessionsByDate[dateString].length > 0) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    setCurrentStreak(streak)
  }

  const calculateWeeklyData = (sessionData: SessionRecord[]) => {
    const weekData = [0, 0, 0, 0, 0, 0, 0] // Mon to Sun
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1) + i)
      const dateString = date.toDateString()
      
      const dayMinutes = sessionData
        .filter(session => new Date(session.date).toDateString() === dateString)
        .reduce((total, session) => total + session.duration, 0)
      
      weekData[i] = Math.round(dayMinutes / 60)
    }
    
    setWeeklyData(weekData)
  }

  const calculateMostUsedTechnique = (sessionData: SessionRecord[]) => {
    if (sessionData.length === 0) {
      setMostUsedTechnique(null)
      return
    }

    const techniqueCounts = sessionData.reduce((acc, session) => {
      acc[session.exercise] = (acc[session.exercise] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostUsed = Object.entries(techniqueCounts).reduce((max, [technique, count]) => 
      count > max.count ? { technique, count } : max
    , { technique: '', count: 0 })

    if (mostUsed.technique) {
      const percentage = Math.round((mostUsed.count / sessionData.length) * 100)
      setMostUsedTechnique({ name: mostUsed.technique, percentage })
    }
  }

  const maxWeeklyMinutes = Math.max(...weeklyData, 1)
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Show empty state if no sessions
  if (sessions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 overflow-y-auto">
        <motion.div
          className="text-center space-y-6 max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-500/20 to-violet-600/20 flex items-center justify-center"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <BarChart3 className="w-10 h-10 text-blue-400" />
          </motion.div>
          
          <div className="space-y-3">
            <h2 className="text-2xl tracking-wide">Your Journey Awaits</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your progress will appear here once you complete your first breathing session.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Button
              onClick={onStartPractice}
              className="h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 transition-all duration-300 aora-glow tracking-wide shadow-2xl"
            >
              Start Your First Session
            </Button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Header */}
      <motion.div 
        className="pt-16 pb-6 px-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-2xl tracking-wide">Progress</h1>
        <p className="text-muted-foreground mt-1">Your breathing journey, {userName}</p>
      </motion.div>

      <div className="px-6 space-y-8 pb-32">
        {/* Streak Banner */}
        <motion.div
          className="glass-card rounded-2xl p-6 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
        >
          <div className="flex items-center space-x-4">
            <motion.div 
              className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center"
              animate={{ 
                scale: currentStreak > 0 ? [1, 1.1, 1] : 1,
                filter: currentStreak > 0 ? ['hue-rotate(0deg)', 'hue-rotate(20deg)', 'hue-rotate(0deg)'] : 'hue-rotate(0deg)'
              }}
              transition={{ 
                duration: 2,
                repeat: currentStreak > 0 ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <Flame className="w-8 h-8 text-white" />
            </motion.div>
            
            <div className="flex-1">
              <div className="flex items-baseline space-x-2">
                <h3 className="text-xl">Current Streak</h3>
                <span className="text-3xl bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent tracking-wider">
                  {currentStreak}
                </span>
                <span className="text-muted-foreground">
                  {currentStreak === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStreak > 0 
                  ? "One breath at a time, keep going!" 
                  : "Start your journey today"
                }
              </p>
            </div>
          </div>
        </motion.div>

        {/* Daily Goal Rings */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {/* Minutes Today */}
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#minutesGradient)"
                  strokeWidth="2"
                  strokeDasharray="100, 100"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - Math.min((todayMinutes / dailyMinutesGoal) * 100, 100) }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="minutesGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-medium">{todayMinutes}</span>
              </div>
            </div>
            <h4 className="text-sm text-muted-foreground">Minutes Today</h4>
            <p className="text-xs text-muted-foreground mt-1">Goal: {dailyMinutesGoal}min</p>
          </div>

          {/* Sessions Today */}
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#sessionsGradient)"
                  strokeWidth="2"
                  strokeDasharray="100, 100"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - Math.min((todaySessions / dailySessionsGoal) * 100, 100) }}
                  transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="sessionsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-medium">{todaySessions}</span>
              </div>
            </div>
            <h4 className="text-sm text-muted-foreground">Sessions Today</h4>
            <p className="text-xs text-muted-foreground mt-1">Goal: {dailySessionsGoal}</p>
          </div>
        </motion.div>

        {/* Weekly Bar Chart */}
        <motion.div
          className="glass-card rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3>This Week</h3>
          </div>
          
          <div className="flex items-end justify-between h-32 space-x-2">
            {weeklyData.map((minutes, index) => (
              <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                <motion.div
                  className="w-full bg-gradient-to-t from-blue-500 to-violet-500 rounded-t"
                  style={{ minHeight: '4px' }}
                  initial={{ height: 4 }}
                  animate={{ 
                    height: Math.max(4, (minutes / maxWeeklyMinutes) * 100)
                  }}
                  transition={{ 
                    delay: 0.5 + index * 0.1, 
                    duration: 0.8, 
                    ease: "easeOut" 
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  {dayLabels[index]}
                </span>
                <span className="text-xs font-medium">
                  {minutes}m
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Most Used Technique */}
        {mostUsedTechnique && (
          <motion.div
            className="glass-card rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-5 h-5 text-amber-400" />
              <h3>Most Used Technique</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{mostUsedTechnique.name}</p>
                <p className="text-sm text-muted-foreground">
                  {mostUsedTechnique.percentage}% of sessions
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-2xl bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  {mostUsedTechnique.percentage}%
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Progress 
                value={mostUsedTechnique.percentage} 
                className="h-2"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}