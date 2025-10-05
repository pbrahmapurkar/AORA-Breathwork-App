import { useState, useEffect } from 'react'
import { motion } from 'motion/react'

interface CustomSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  color: string
  unit?: string
}

export function CustomSlider({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step,
  color,
  unit = 's'
}: CustomSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  
  const percentage = ((value - min) / (max - min)) * 100

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value))
  }

  return (
    <div className="space-y-3">
      {/* Label and value */}
      <div className="flex justify-between items-center">
        <label className="text-sm text-white/80 tracking-wide">
          {label}
        </label>
        <motion.div 
          className="text-lg tabular-nums"
          animate={{ scale: isDragging ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-white">{value % 1 === 0 ? Math.round(value) : value.toFixed(1)}</span>
          <span className="text-white/40 text-sm ml-1">{unit}</span>
        </motion.div>
      </div>

      {/* Slider track */}
      <div className="relative">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          {/* Progress track */}
          <motion.div
            className={`h-full bg-gradient-to-r ${color} rounded-full`}
            style={{ width: `${percentage}%` }}
            animate={{ 
              boxShadow: isDragging ? `0 0 20px ${color.includes('blue') ? '#2E3AF0' : '#7463FF'}40` : 'none'
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Slider input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {/* Slider thumb */}
        <motion.div
          className={`absolute top-1/2 w-5 h-5 bg-gradient-to-r ${color} rounded-full border-2 border-white/20 -translate-y-1/2 pointer-events-none`}
          style={{ left: `calc(${percentage}% - 10px)` }}
          animate={{ 
            scale: isDragging ? 1.2 : 1,
            boxShadow: isDragging ? '0 0 15px rgba(255,255,255,0.3)' : '0 0 5px rgba(0,0,0,0.2)'
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Tick marks */}
        <div className="flex justify-between mt-2 px-2">
          {Array.from({ length: 5 }, (_, i) => {
            const tickValue = min + (max - min) * (i / 4)
            return (
              <div key={i} className="text-xs text-white/30 text-center">
                {tickValue.toFixed(0)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}