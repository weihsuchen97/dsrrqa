import { motion, AnimatePresence } from 'framer-motion'
import { useWeather } from '@/hooks/useWeather'

export function WeatherWidget() {
  const { weather, error } = useWeather()

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 border border-white/8 shrink-0">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.span
            key="error"
            className="text-[12px] text-white/40 w-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            🌡️ 無法取得天氣資訊
          </motion.span>
        ) : !weather ? (
          <motion.span
            key="loading"
            className="text-[12px] text-white/40 w-full animate-pulse"
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
            <span className="text-[17px] leading-none">{weather.emoji}</span>
            <span className="text-[12px] font-medium text-white/80">{weather.city}</span>
            <span className="text-[15px] font-semibold text-white tabular-nums">{weather.temperature}°C</span>
            <span className="text-[11px] text-white/50 ml-auto truncate">{weather.description}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
