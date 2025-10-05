// Central notification service for AORA
export class NotificationService {
  private static instance: NotificationService
  private notificationTimeouts: Set<number> = new Set()

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }
    return await Notification.requestPermission()
  }

  scheduleBreathingReminder(intervalMs: number): void {
    this.clearAllReminders()
    
    const scheduleNext = () => {
      const timeoutId = window.setTimeout(() => {
        this.showBreathingReminder()
        this.notificationTimeouts.delete(timeoutId)
        scheduleNext() // Schedule the next reminder
      }, intervalMs)
      
      this.notificationTimeouts.add(timeoutId)
    }

    scheduleNext()
  }

  clearAllReminders(): void {
    this.notificationTimeouts.forEach(timeoutId => {
      clearTimeout(timeoutId)
    })
    this.notificationTimeouts.clear()
  }

  private showBreathingReminder(): void {
    if (Notification.permission !== 'granted') {
      return
    }

    // Check if user is currently in the app
    if (!document.hidden) {
      return // Don't show notification if app is active
    }

    const messages = [
      'Time for a mindful breath. Take a moment to center yourself.',
      'Your breath is waiting. Step into presence with AORA.',
      'A gentle reminder to breathe deeply and find your calm.',
      'Take three conscious breaths. Your future self will thank you.',
      'The breath between moments is calling. Answer with presence.',
      'Pause. Breathe. Reset. Your mindful moment awaits.',
      'Let your breath guide you back to stillness.',
      'Three breaths can change everything. Begin now.'
    ]

    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    
    const notification = new Notification('AORA Breathing Reminder', {
      body: randomMessage,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'aora-breathing-reminder',
      requireInteraction: false,
      silent: false,
      timestamp: Date.now()
    })

    // Auto close after 8 seconds
    setTimeout(() => notification.close(), 8000)

    // Handle notification click
    notification.onclick = () => {
      window.focus()
      notification.close()
      
      // Try to navigate to the app if possible
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
  }

  showSessionSavedNotification(): void {
    if (Notification.permission !== 'granted') {
      return
    }

    const notification = new Notification('Session Auto-Saved', {
      body: 'Your breathing session has been saved. You can resume it later.',
      icon: '/favicon.ico',
      tag: 'aora-session-saved',
      requireInteraction: false,
      silent: true
    })

    setTimeout(() => notification.close(), 4000)
  }

  showWelcomeNotification(): void {
    if (Notification.permission !== 'granted') {
      return
    }

    const notification = new Notification('Welcome to AORA', {
      body: 'You\'ll now receive gentle breathing reminders. Find peace in every moment. 🌟',
      icon: '/favicon.ico',
      tag: 'aora-welcome',
      requireInteraction: false
    })

    setTimeout(() => notification.close(), 5000)
  }

  // Check if quiet hours are active
  isQuietHours(quietHours: { enabled: boolean; start: string; end: string }): boolean {
    if (!quietHours.enabled) return false

    const now = new Date()
    const currentTime = now.getHours() * 100 + now.getMinutes()
    const startTime = parseInt(quietHours.start.replace(':', ''))
    const endTime = parseInt(quietHours.end.replace(':', ''))

    if (startTime > endTime) {
      // Quiet hours span midnight (e.g., 22:00 to 08:00)
      return currentTime >= startTime || currentTime <= endTime
    } else {
      // Quiet hours within same day
      return currentTime >= startTime && currentTime <= endTime
    }
  }
}

export const notificationService = NotificationService.getInstance()