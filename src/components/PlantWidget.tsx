import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useSettings } from '@/hooks/useSettings'
import { PLANT_SPECIES_CONFIG, type PlantSpecies } from '@/types/settings'

interface PlantWidgetProps {
  completionRate: number // 0 to 1
  total: number
  done: number
}

type PlantStage = 'seed' | 'seedling' | 'sprout' | 'lush' | 'blooming'

function getStage(exp: number): PlantStage {
  if (exp < 10) return 'seed'
  if (exp < 30) return 'seedling'
  if (exp < 55) return 'sprout'
  if (exp < 80) return 'lush'
  return 'blooming'
}

const STAGE_LABELS: Record<PlantStage, string> = {
  seed: '種子期',
  seedling: '幼苗期',
  sprout: '成長期',
  lush: '茂盛期',
  blooming: '盛開期',
}

type HealthStatus = 'healthy' | 'thirsty' | 'wilting'

function getHealthStatus(water: number, sunlight: number): { label: string; status: HealthStatus } {
  const avg = (water + sunlight) / 2
  if (avg > 60) return { label: '健康', status: 'healthy' }
  if (avg > 30) return { label: '口渴', status: 'thirsty' }
  return { label: '枯萎中', status: 'wilting' }
}

// ── Plant SVGs per species ──
function PlantSVG({ species, stage, isWilting }: { species: PlantSpecies; stage: PlantStage; isWilting: boolean }) {
  const wiltRotate = isWilting ? 8 : 0
  const wiltOpacity = isWilting ? 0.6 : 1

  return (
    <svg viewBox="0 0 100 90" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Pot (different color per species) */}
      <motion.g
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ filter: isWilting ? 'saturate(0.5)' : 'none' }}
      >
        <PotSVG species={species} />
      </motion.g>

      {/* Plant body */}
      <motion.g
        animate={{ rotate: wiltRotate, opacity: wiltOpacity }}
        style={{ transformOrigin: '50px 74px' }}
        transition={{ duration: 1 }}
      >
        <PlantBody species={species} stage={stage} />
      </motion.g>
    </svg>
  )
}

function PotSVG({ species }: { species: PlantSpecies }) {
  const potColors: Record<PlantSpecies, [string, string]> = {
    succulent: ['#8b5e3c', '#a0714f'],
    sunflower: ['#d97706', '#f59e0b'],
    sakura:    ['#be185d', '#ec4899'],
    cactus:    ['#92400e', '#b45309'],
    bonsai:    ['#1e3a5f', '#2563eb'],
  }
  const [body, rim] = potColors[species]
  return (
    <>
      <path d="M30 80 L70 80 L65 90 L35 90 Z" fill={body} />
      <rect x="28" y="74" width="44" height="8" rx="3" fill={rim} />
      <rect x="30" y="76" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
      <ellipse cx="50" cy="74" rx="20" ry="4" fill="#5d4037" />
    </>
  )
}

function PlantBody({ species, stage }: { species: PlantSpecies; stage: PlantStage }) {
  if (stage === 'seed') {
    return (
      <motion.ellipse
        cx="50" cy="70" rx="4" ry="3"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        fill="#8b6914"
      />
    )
  }

  const configs: Record<PlantSpecies, { stemColor: string; leafColor: string; flowerColor: string; accentColor: string }> = {
    succulent:  { stemColor: '#4a7c59', leafColor: '#22c55e', flowerColor: '#86efac', accentColor: '#15803d' },
    sunflower:  { stemColor: '#15803d', leafColor: '#22c55e', flowerColor: '#fbbf24', accentColor: '#92400e' },
    sakura:     { stemColor: '#8b5e3c', leafColor: '#22c55e', flowerColor: '#f9a8d4', accentColor: '#be185d' },
    cactus:     { stemColor: '#15803d', leafColor: '#22c55e', flowerColor: '#f472b6', accentColor: '#166534' },
    bonsai:     { stemColor: '#78350f', leafColor: '#15803d', flowerColor: '#22c55e', accentColor: '#166534' },
  }
  const c = configs[species]
  const isSeedling = stage === 'seedling'
  const hasBranch = stage !== 'seedling'
  const isLush = stage === 'lush' || stage === 'blooming'
  const isBlooming = stage === 'blooming'
  const stemTop = isSeedling ? 60 : hasBranch && !isLush ? 45 : 30

  return (
    <>
      {/* Stem */}
      <motion.line
        x1="50" y1="74" x2="50"
        initial={{ y2: 74 }} animate={{ y2: stemTop }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        stroke={c.stemColor} strokeWidth={species === 'bonsai' ? 5 : 3} strokeLinecap="round"
      />

      {/* Branches */}
      <AnimatePresence>
        {hasBranch && (
          <>
            <motion.line
              key="lb" x1="50" y1="52" x2="50" y2="52"
              animate={{ x2: 30, y2: 42 }} initial={{ x2: 50, y2: 52 }} exit={{ x2: 50, y2: 52 }}
              transition={{ duration: 0.6 }}
              stroke={c.stemColor} strokeWidth="2" strokeLinecap="round"
            />
            <motion.line
              key="rb" x1="50" y1="48" x2="50" y2="48"
              animate={{ x2: 70, y2: 38 }} initial={{ x2: 50, y2: 48 }} exit={{ x2: 50, y2: 48 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              stroke={c.stemColor} strokeWidth="2" strokeLinecap="round"
            />
            <motion.ellipse
              key="ll" cx="26" cy="38"
              initial={{ rx: 0, ry: 0, opacity: 0 }} animate={{ rx: 11, ry: 7, opacity: 1 }}
              exit={{ rx: 0, ry: 0, opacity: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              fill={c.leafColor} transform="rotate(-30 26 38)"
            />
            <motion.ellipse
              key="rl" cx="73" cy="34"
              initial={{ rx: 0, ry: 0, opacity: 0 }} animate={{ rx: 11, ry: 7, opacity: 1 }}
              exit={{ rx: 0, ry: 0, opacity: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              fill={c.accentColor} transform="rotate(30 73 34)"
            />
          </>
        )}
      </AnimatePresence>

      {/* Crown */}
      <AnimatePresence>
        {isLush && (
          <motion.g key="crown">
            <motion.ellipse cx="50" cy="26" initial={{ rx: 0, ry: 0, opacity: 0 }}
              animate={{ rx: 14, ry: 10, opacity: 1 }} exit={{ rx: 0, ry: 0, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }} fill={c.accentColor}
            />
            <motion.ellipse cx="42" cy="22" initial={{ rx: 0, ry: 0, opacity: 0 }}
              animate={{ rx: 10, ry: 7, opacity: 1 }} exit={{ rx: 0, ry: 0, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }} fill={c.leafColor}
            />
            <motion.ellipse cx="58" cy="22" initial={{ rx: 0, ry: 0, opacity: 0 }}
              animate={{ rx: 10, ry: 7, opacity: 1 }} exit={{ rx: 0, ry: 0, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }} fill={c.leafColor}
            />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Flowers */}
      <AnimatePresence>
        {isBlooming && (
          <motion.g key="flowers">
            {[{ cx: 50, cy: 14 }, { cx: 37, cy: 22 }, { cx: 63, cy: 22 }].map(({ cx, cy }, i) => (
              <motion.g key={i}>
                {[0, 60, 120, 180, 240, 300].map((angle) => {
                  const rad = (angle * Math.PI) / 180
                  return (
                    <motion.ellipse
                      key={angle}
                      cx={cx + Math.cos(rad) * 5} cy={cy + Math.sin(rad) * 5}
                      initial={{ rx: 0, ry: 0, opacity: 0 }}
                      animate={{ rx: 3.5, ry: 2.5, opacity: 1 }}
                      exit={{ rx: 0, ry: 0, opacity: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                      fill={c.flowerColor}
                      transform={`rotate(${angle} ${cx + Math.cos(rad) * 5} ${cy + Math.sin(rad) * 5})`}
                    />
                  )
                })}
                <motion.circle cx={cx} cy={cy} r={3}
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                  fill={species === 'sunflower' ? '#92400e' : '#fbbf24'}
                />
              </motion.g>
            ))}
          </motion.g>
        )}
      </AnimatePresence>

      {/* Cactus spines */}
      {species === 'cactus' && stage !== 'seedling' && (
        <g>
          {[{ x: 44, y: 50 }, { x: 56, y: 45 }, { x: 46, y: 38 }, { x: 54, y: 55 }].map((p, i) => (
            <line key={i} x1={p.x} y1={p.y} x2={p.x + (i % 2 === 0 ? -4 : 4)} y2={p.y - 3}
              stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          ))}
        </g>
      )}
    </>
  )
}

// ── Stat cell for water / sunlight (橫向並列的單格) ──
function StatCell({ value, color, icon, label }: { value: number; color: string; icon: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/55 flex items-center gap-1">
          <span className="text-[12px]">{icon}</span>
          {label}
        </span>
        <span className="text-[11px] text-white/70 tabular-nums font-medium">{Math.round(value)}</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  )
}

export function PlantWidget({ completionRate, total, done }: PlantWidgetProps) {
  const { settings, updatePlant } = useSettings()
  const { plant } = settings
  const stage = getStage(plant.experience)
  const health = getHealthStatus(plant.water, plant.sunlight)
  const speciesCfg = PLANT_SPECIES_CONFIG[plant.species]
  const isWilting = plant.water < 20 || plant.sunlight < 20

  // 任務完成率驅動經驗值成長
  useEffect(() => {
    if (total === 0) return
    const targetExp = Math.min(100, Math.round(completionRate * 100))
    if (Math.abs(targetExp - plant.experience) > 2) {
      updatePlant(prev => ({ ...prev, experience: targetExp }))
    }
  }, [completionRate, total, plant.experience, updatePlant])

  // 水分/陽光隨時間自然衰減（每 30 秒檢查）
  useEffect(() => {
    const interval = setInterval(() => {
      updatePlant(prev => {
        const now = Date.now()
        const lastWatered = new Date(prev.lastWatered).getTime()
        const lastSunlight = new Date(prev.lastSunlight).getTime()
        const hoursSinceWater = (now - lastWatered) / 3600000
        const hoursSinceSun = (now - lastSunlight) / 3600000
        return {
          ...prev,
          water: Math.max(0, prev.water - hoursSinceWater * 0.3),
          sunlight: Math.max(0, prev.sunlight - hoursSinceSun * 0.2),
        }
      })
    }, 30000)
    return () => clearInterval(interval)
  }, [updatePlant])

  const handleWater = useCallback(() => {
    updatePlant(prev => ({
      ...prev,
      water: Math.min(100, prev.water + 25),
      lastWatered: new Date().toISOString(),
    }))
  }, [updatePlant])

  const handleSunlight = useCallback(() => {
    updatePlant(prev => ({
      ...prev,
      sunlight: Math.min(100, prev.sunlight + 25),
      lastSunlight: new Date().toISOString(),
    }))
  }, [updatePlant])

  return (
    <div className="flex items-stretch gap-3 py-1 h-full">
      {/* Plant SVG — 左欄填滿高度，和右欄視覺等重 */}
      <div className="w-24 shrink-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${plant.species}-${stage}`}
            className="w-full aspect-square"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <PlantSVG species={plant.species} stage={stage} isWilting={isWilting} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 右欄：標題群 → 經驗值群 → 水陽光群 → 按鈕群 → footer */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
        {/* Group 1: 標題（emoji + 名稱 + 健康徽章） */}
        <div className="flex items-center gap-1.5">
          <span className="text-[15px] leading-none">{speciesCfg.emoji}</span>
          <span className="text-[13px] font-medium text-white/85">{speciesCfg.name}</span>
          <span className={`status-badge status-${health.status} ml-auto`}>
            {health.label}
          </span>
        </div>

        {/* Group 2: 主進度（階段 + exp），exp bar 加粗以建立層級 */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-white/55">{STAGE_LABELS[stage]}</span>
            <span className="text-[11px] text-white/50 tabular-nums">{Math.round(plant.experience)}<span className="text-white/30">/100</span></span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300"
              animate={{ width: `${plant.experience}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>

        {/* Group 3: 水 + 陽光 橫向並列 */}
        <div className="grid grid-cols-2 gap-3">
          <StatCell value={plant.water} color="#38bdf8" icon="💧" label="水分" />
          <StatCell value={plant.sunlight} color="#fbbf24" icon="☀️" label="陽光" />
        </div>

        {/* Group 4: 動作按鈕 */}
        <div className="flex gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleWater}
                className="flex-1 text-[11px] py-1.5 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/25 transition-all font-medium"
              >
                💧 澆水
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>為植物澆水 (+25)</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSunlight}
                className="flex-1 text-[11px] py-1.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all font-medium"
              >
                ☀️ 曬太陽
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>給植物陽光 (+25)</p></TooltipContent>
          </Tooltip>
        </div>

        {/* Footer 任務進度（右對齊，極輕量） */}
        {total > 0 && (
          <div className="text-[11px] text-white/35 text-right tabular-nums">
            任務 {done}/{total}
          </div>
        )}
      </div>
    </div>
  )
}
