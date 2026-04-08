import { motion, AnimatePresence } from 'framer-motion'

interface PlantWidgetProps {
  completionRate: number // 0 to 1
  total: number
  done: number
}

type PlantStage = 'seedling' | 'sprout' | 'lush' | 'blooming'

function getStage(rate: number): PlantStage {
  if (rate < 0.25) return 'seedling'
  if (rate < 0.5)  return 'sprout'
  if (rate < 0.75) return 'lush'
  return 'blooming'
}

const STAGE_CONFIG: Record<PlantStage, { label: string; emoji: string; color: string }> = {
  seedling: { label: '幼苗期',  emoji: '🌱', color: '#86efac' },
  sprout:   { label: '成長期',  emoji: '🌿', color: '#4ade80' },
  lush:     { label: '茂盛期',  emoji: '🌳', color: '#22c55e' },
  blooming: { label: '盛開期',  emoji: '🌸', color: '#f472b6' },
}

// Animated SVG plant that grows through stages
function PlantSVG({ stage }: { stage: PlantStage }) {
  const isLush     = stage === 'lush' || stage === 'blooming'
  const isBlooming = stage === 'blooming'
  const hasBranch  = stage !== 'seedling'

  return (
    <svg viewBox="0 0 100 90" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Pot */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <path d="M30 80 L70 80 L65 90 L35 90 Z" fill="#8b5e3c" />
        <rect x="28" y="74" width="44" height="8" rx="3" fill="#a0714f" />
        <rect x="30" y="76" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
      </motion.g>

      {/* Soil */}
      <ellipse cx="50" cy="74" rx="20" ry="4" fill="#5d4037" />

      {/* Main stem */}
      <motion.line
        x1="50" y1="74"
        x2="50"
        initial={{ y2: 74 }}
        animate={{ y2: stage === 'seedling' ? 60 : stage === 'sprout' ? 45 : 30 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        stroke="#4a7c59" strokeWidth="3" strokeLinecap="round"
      />

      {/* Left branch */}
      <AnimatePresence>
        {hasBranch && (
          <motion.line
            key="left-branch"
            x1="50" y1="52"
            x2="50" y2="52"
            animate={{ x2: 30, y2: 42 }}
            initial={{ x2: 50, y2: 52 }}
            exit={{ x2: 50, y2: 52 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            stroke="#4a7c59" strokeWidth="2" strokeLinecap="round"
          />
        )}
      </AnimatePresence>

      {/* Right branch */}
      <AnimatePresence>
        {hasBranch && (
          <motion.line
            key="right-branch"
            x1="50" y1="48"
            x2="50" y2="48"
            animate={{ x2: 70, y2: 38 }}
            initial={{ x2: 50, y2: 48 }}
            exit={{ x2: 50, y2: 48 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            stroke="#4a7c59" strokeWidth="2" strokeLinecap="round"
          />
        )}
      </AnimatePresence>

      {/* Leaf left */}
      <AnimatePresence>
        {hasBranch && (
          <motion.ellipse
            key="leaf-left"
            cx="26" cy="38"
            initial={{ rx: 0, ry: 0, opacity: 0 }}
            animate={{ rx: 11, ry: 7, opacity: 1 }}
            exit={{ rx: 0, ry: 0, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            fill="#22c55e" transform="rotate(-30 26 38)"
          />
        )}
      </AnimatePresence>

      {/* Leaf right */}
      <AnimatePresence>
        {hasBranch && (
          <motion.ellipse
            key="leaf-right"
            cx="73" cy="34"
            initial={{ rx: 0, ry: 0, opacity: 0 }}
            animate={{ rx: 11, ry: 7, opacity: 1 }}
            exit={{ rx: 0, ry: 0, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            fill="#16a34a" transform="rotate(30 73 34)"
          />
        )}
      </AnimatePresence>

      {/* Top leaves / crown */}
      <AnimatePresence>
        {isLush && (
          <motion.g key="crown">
            <motion.ellipse
              cx="50" cy="26"
              initial={{ rx: 0, ry: 0, opacity: 0 }}
              animate={{ rx: 14, ry: 10, opacity: 1 }}
              exit={{ rx: 0, ry: 0, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              fill="#15803d"
            />
            <motion.ellipse
              cx="42" cy="22"
              initial={{ rx: 0, ry: 0, opacity: 0 }}
              animate={{ rx: 10, ry: 7, opacity: 1 }}
              exit={{ rx: 0, ry: 0, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              fill="#22c55e"
            />
            <motion.ellipse
              cx="58" cy="22"
              initial={{ rx: 0, ry: 0, opacity: 0 }}
              animate={{ rx: 10, ry: 7, opacity: 1 }}
              exit={{ rx: 0, ry: 0, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              fill="#22c55e"
            />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Flowers (blooming stage) */}
      <AnimatePresence>
        {isBlooming && (
          <motion.g key="flowers">
            {[
              { cx: 50, cy: 14 }, { cx: 37, cy: 22 }, { cx: 63, cy: 22 },
            ].map(({ cx, cy }, i) => (
              <motion.g key={i}>
                {[0, 60, 120, 180, 240, 300].map((angle) => {
                  const rad = (angle * Math.PI) / 180
                  return (
                    <motion.ellipse
                      key={angle}
                      cx={cx + Math.cos(rad) * 5}
                      cy={cy + Math.sin(rad) * 5}
                      initial={{ rx: 0, ry: 0, opacity: 0 }}
                      animate={{ rx: 3.5, ry: 2.5, opacity: 1 }}
                      exit={{ rx: 0, ry: 0, opacity: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                      fill="#f472b6"
                      transform={`rotate(${angle} ${cx + Math.cos(rad) * 5} ${cy + Math.sin(rad) * 5})`}
                    />
                  )
                })}
                <motion.circle
                  cx={cx} cy={cy} r={3}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                  fill="#fbbf24"
                />
              </motion.g>
            ))}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  )
}

export function PlantWidget({ completionRate, total, done }: PlantWidgetProps) {
  const stage = getStage(completionRate)
  const config = STAGE_CONFIG[stage]
  const pct = Math.round(completionRate * 100)

  return (
    <div className="flex items-center gap-3 px-3 py-2 shrink-0">
      {/* Plant SVG */}
      <div className="w-20 h-20 shrink-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            className="w-full h-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <PlantSVG stage={stage} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{config.emoji}</span>
          <span className="text-xs font-medium text-white/70">{config.label}</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: config.color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        <div className="text-xs text-white/40">
          {total === 0
            ? '新增任務開始生長 🌱'
            : `完成 ${done} / ${total} 項 (${pct}%)`}
        </div>
      </div>
    </div>
  )
}
