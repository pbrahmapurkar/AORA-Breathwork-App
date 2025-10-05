import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Bell, BellOff, Clock } from 'lucide-react'
import { notificationService } from './NotificationService'

interface NotificationSettings {
  enabled: boolean
  frequency: 'hourly' | '2hours' | '4hours' | '8hours' | 'daily'
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

interface NotificationManagerProps {
  onSettingsChange?: (settings: NotificationSettings) => void
}

export function NotificationManager({ onSettingsChange }: NotificationManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    frequency: '2hours',
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    }
  })

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // Load saved settings
    const savedSettings = localStorage.getItem('aora-notification-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings(parsed)
    }
  }, [])

  useEffect(() => {
    // Save settings and notify parent
    localStorage.setItem('aora-notification-settings', JSON.stringify(settings))
    onSettingsChange?.(settings)
    
    // Schedule notifications if enabled
    if (settings.enabled && permission === 'granted') {
      scheduleNotifications()
    } else {
      clearScheduledNotifications()
    }
  }, [settings, permission, onSettingsChange])

  const requestPermission = async () => {
    const result = await notificationService.requestPermission()
    setPermission(result)
    
    if (result === 'granted') {
      notificationService.showWelcomeNotification()
    }
  }

  const showNotification = (title: string, body: string, icon?: string) => {
    if (permission === 'granted' && 'Notification' in window) {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'aora-reminder',
        requireInteraction: false,
        silent: false
      })
      
      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000)
      
      // Handle notification click
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }
  }

  const scheduleNotifications = () => {
    clearScheduledNotifications()
    
    const intervalMs = getIntervalMs(settings.frequency)
    const intervalId = setInterval(() => {
      if (shouldShowNotification()) {
        const messages = [
          'Time for a mindful breath. Take a moment to center yourself.',
          'Your breath is waiting. Step into presence with AORA.',
          'A gentle reminder to breathe deeply and find your calm.',
          'Take three conscious breaths. Your future self will thank you.',
          'The breath between moments is calling. Answer with presence.'
        ]
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)]
        showNotification('Breathing Reminder', randomMessage, '🫁')
      }
    }, intervalMs)
    
    localStorage.setItem('aora-notification-interval', intervalId.toString())
  }

  const clearScheduledNotifications = () => {
    const intervalId = localStorage.getItem('aora-notification-interval')
    if (intervalId) {
      clearInterval(parseInt(intervalId))
      localStorage.removeItem('aora-notification-interval')
    }
  }

  const getIntervalMs = (frequency: string): number => {
    const intervals = {
      'hourly': 60 * 60 * 1000,
      '2hours': 2 * 60 * 60 * 1000,
      '4hours': 4 * 60 * 60 * 1000,
      '8hours': 8 * 60 * 60 * 1000,
      'daily': 24 * 60 * 60 * 1000
    }
    return intervals[frequency as keyof typeof intervals] || intervals['2hours']
  }

  const shouldShowNotification = (): boolean => {
    if (!settings.quietHours.enabled) return true
    
    const now = new Date()
    const currentTime = now.getHours() * 100 + now.getMinutes()
    const startTime = parseInt(settings.quietHours.start.replace(':', ''))
    const endTime = parseInt(settings.quietHours.end.replace(':', ''))
    
    if (startTime > endTime) {
      // Quiet hours span midnight (e.g., 22:00 to 08:00)
      return currentTime < startTime && currentTime > endTime
    } else {
      // Quiet hours within same day
      return currentTime < startTime || currentTime > endTime
    }
  }

  const handleToggleEnabled = (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      requestPermission()
    }
    setSettings(prev => ({ ...prev, enabled }))
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Breathing Reminders
        </CardTitle>
        <CardDescription>
          Gentle notifications to help you maintain your breathing practice
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Permission Status */}
        {permission === 'denied' && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <BellOff className="w-4 h-4" />
              <span className="font-medium">Notifications Blocked</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Please enable notifications in your browser settings to receive breathing reminders.
            </p>
          </div>
        )}

        {permission === 'default' && (
          <div className="p-4 rounded-lg bg-accent border border-border">
            <div className="flex items-center gap-2 text-accent-foreground mb-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Enable Notifications</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Allow AORA to send you gentle breathing reminders throughout the day.
            </p>
            <Button onClick={requestPermission} size="sm">
              Allow Notifications
            </Button>
          </div>
        )}

        {/* Settings */}
        <div className="space-y-4">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Enable Reminders</label>
              <p className="text-sm text-muted-foreground">
                Receive periodic breathing reminders
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={handleToggleEnabled}
              disabled={permission === 'denied'}
            />
          </div>

          {/* Frequency */}
          {settings.enabled && (
            <>
              <div className="space-y-2">
                <label className="font-medium">Reminder Frequency</label>
                <Select
                  value={settings.frequency}
                  onValueChange={(value) => setSettings(prev => ({ 
                    ...prev, 
                    frequency: value as typeof settings.frequency 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Every hour</SelectItem>
                    <SelectItem value="2hours">Every 2 hours</SelectItem>
                    <SelectItem value="4hours">Every 4 hours</SelectItem>
                    <SelectItem value="8hours">Every 8 hours</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Quiet Hours</label>
                    <p className="text-sm text-muted-foreground">
                      Pause reminders during sleep hours
                    </p>
                  </div>
                  <Switch
                    checked={settings.quietHours.enabled}
                    onCheckedChange={(enabled) => setSettings(prev => ({ 
                      ...prev, 
                      quietHours: { ...prev.quietHours, enabled }
                    }))}
                  />
                </div>

                {settings.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sm">From</label>
                      <input
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, start: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-input-background border border-border rounded-md"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm">To</label>
                      <input
                        type="time"
                        value={settings.quietHours.end}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, end: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-input-background border border-border rounded-md"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Test Notification */}
        {permission === 'granted' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => showNotification(
              'Test Notification',
              'Your AORA breathing reminders are working perfectly! 🌟'
            )}
            className="w-full"
          >
            Test Notification
          </Button>
        )}
      </CardContent>
    </Card>
  )
}