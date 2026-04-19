import { useRef, useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Seaweed, renderCreatureById } from './FishCreatures'
import { useFishAnimation, type FishDef } from '@/hooks/useFishAnimation'
import { useSettings } from '@/hooks/useSettings'
import type { CreatureId } from '@/types/settings'

const SWIM_STYLES: Array<FishDef['style']> = ['linear', 'wave', 'dart', 'drift']
const SPEEDS = [55, 40, 45, 22, 50, 35, 60]

function buildFishDefs(creatures: CreatureId[]): FishDef[] {
  return creatures.map((id, i) => ({
    id: `tank-${id}-${i}`,
    type: id,
    style: SWIM_STYLES[i % SWIM_STYLES.length],
    speed: SPEEDS[i % SPEEDS.length],
  }))
}

const SEAWEEDS = [
  { x: 8,  h: 38, color: '#15803d' },
  { x: 22, h: 28, color: '#16a34a' },
  { x: 62, h: 44, color: '#15803d' },
  { x: 78, h: 32, color: '#166534' },
  { x: 88, h: 50, color: '#14532d' },
]

export function FishTank({ height = 82 }: { height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const { settings } = useSettings()

  const fishDefs = useMemo(() => buildFishDefs(settings.enabledCreatures), [settings.enabledCreatures])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height: h } = entry.contentRect
        setSize({ w: width, h })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { renderStates, scatter } = useFishAnimation(fishDefs, size.w, size.h)

  return (
    <div
      ref={containerRef}
      className="fish-tank shrink-0"
      style={{ height }}
    >
      {/* Seaweed */}
      {SEAWEEDS.map((sw, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0"
          style={{ left: `${sw.x}%`, transformOrigin: 'bottom center' }}
          animate={{ rotate: [0, 4, -4, 3, -2, 0] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Seaweed height={sw.h} color={sw.color} />
        </motion.div>
      ))}

      {/* Bubbles */}
      <Bubbles containerH={height} />

      {/* Creatures */}
      {renderStates.map((rs) => {
        const def = fishDefs.find((f) => f.id === rs.id)
        if (!def) return null
        return (
          <div
            key={rs.id}
            className="absolute cursor-pointer"
            style={{
              left: rs.x,
              top: rs.y,
              transform: 'translate(-50%, -50%)',
              transition: 'none',
            }}
            onClick={() => scatter(rs.id)}
          >
            {renderCreatureById(def.type, 0.65, rs.facingRight, def.color)}
          </div>
        )
      })}

      {/* Water surface shimmer */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}

function Bubbles({ containerH }: { containerH: number }) {
  const bubbles = [
    { x: '15%', delay: 0 },
    { x: '45%', delay: 1.2 },
    { x: '70%', delay: 0.6 },
    { x: '85%', delay: 2.1 },
  ]

  return (
    <>
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full border border-white/20"
          style={{ left: b.x, bottom: 4 }}
          animate={{
            y: [-2, -containerH + 8],
            opacity: [0.6, 0],
            scale: [0.6, 1.2],
          }}
          transition={{
            duration: 2.5 + i * 0.5,
            delay: b.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </>
  )
}
