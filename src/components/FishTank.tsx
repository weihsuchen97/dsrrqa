import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FishA, FishB, Shrimp, Seaweed } from './FishCreatures'
import { useFishAnimation, type FishDef } from '@/hooks/useFishAnimation'

const FISH_DEFS: FishDef[] = [
  { id: 'f1', type: 'fishA', style: 'linear', color: '#f97316', speed: 55 },
  { id: 'f2', type: 'fishB', style: 'wave',   color: '#818cf8', speed: 40 },
  { id: 'f3', type: 'fishA', style: 'dart',   color: '#34d399', speed: 45 },
  { id: 'sh', type: 'shrimp', style: 'drift', speed: 22 },
]

const SEAWEEDS = [
  { x: 8,  h: 38, color: '#15803d' },
  { x: 22, h: 28, color: '#16a34a' },
  { x: 62, h: 44, color: '#15803d' },
  { x: 78, h: 32, color: '#166534' },
  { x: 88, h: 50, color: '#14532d' },
]

function renderFish(type: string, color: string | undefined, scale: number, facingRight: boolean) {
  const flip = { transform: facingRight ? 'scaleX(1)' : 'scaleX(-1)', display: 'block' }
  if (type === 'fishA') return <div style={flip}><FishA color={color} scale={scale} /></div>
  if (type === 'fishB') return <div style={flip}><FishB color={color} scale={scale} /></div>
  return <div style={flip}><Shrimp scale={scale} /></div>
}

export function FishTank() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    if (!containerRef.current) return
    const { width, height } = containerRef.current.getBoundingClientRect()
    setSize({ w: width, h: height })
  }, [])

  const { renderStates, scatter } = useFishAnimation(FISH_DEFS, size.w, size.h)

  return (
    <div
      ref={containerRef}
      className="fish-tank w-full shrink-0"
      style={{ height: 82 }}
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
      <Bubbles containerH={82} />

      {/* Fish — 可點擊觸發逃跑 */}
      {renderStates.map((rs) => {
        const def = FISH_DEFS.find((f) => f.id === rs.id)!
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
            {renderFish(def.type, def.color, 0.65, rs.facingRight)}
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
