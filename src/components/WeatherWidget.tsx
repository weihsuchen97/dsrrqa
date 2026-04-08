import { motion, AnimatePresence } from 'framer-motion'
import { useWeather } from '@/hooks/useWeather'

export function WeatherWidget() {
  const { weather, error } = useWeather()

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 shrink-0">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.span
            key="error"
            className="text-xs text-white/30 w-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            🌡️ 無法取得天氣資訊
          </motion.span>
        ) : !weather ? (
          <motion.span
            key="loading"
            className="text-xs text-white/30 w-full animate-pulse"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            取得天氣中…
          </motion.span>
        ) : (
          <motion.div
            key="weather"
            className="flex items-center gap-2 w-full"
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-xl">{weather.emoji}</span>
            <span className="text-xs font-medium text-white/80">{weather.city}</span>
            <span className="text-sm font-bold text-white">{weather.temperature}°C</span>
            <span className="text-xs text-white/50 ml-auto">{weather.description}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
