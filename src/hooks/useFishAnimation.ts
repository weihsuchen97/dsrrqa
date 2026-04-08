import { useEffect, useRef, useState, useCallback } from 'react'

export type SwimStyle = 'linear' | 'wave' | 'drift' | 'dart'

export interface FishDef {
  id: string
  type: 'fishA' | 'fishB' | 'shrimp'
  style: SwimStyle
  color?: string
  scale?: number
  speed: number
}

export interface FishRenderState {
  id: string
  x: number
  y: number
  facingRight: boolean
  opacity: number
}

interface FishInternalState {
  x: number
  y: number
  facingRight: boolean
  // Wave
  t: number
  baseY: number
  // Dart-pause
  phase: 'dart' | 'pause'
  pauseTimer: number
  dartTargetX: number
  dartTargetY: number
  // Drift
  driftTargetX: number
  driftTargetY: number
  // Scatter（點擊逃跑）
  scatterVx: number
  scatterVy: number
  scatterTimer: number
}

export function useFishAnimation(
  fish: FishDef[],
  containerWidth: number,
  containerHeight: number
) {
  const [renderStates, setRenderStates] = useState<FishRenderState[]>([])
  const stateRef = useRef<Map<string, FishInternalState>>(new Map())
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    if (containerWidth <= 0 || containerHeight <= 0) return
    const map = stateRef.current
    fish.forEach((f, i) => {
      if (!map.has(f.id)) {
        const startX = Math.random() * containerWidth * 0.8
        const startY = 20 + Math.random() * (containerHeight - 40)
        map.set(f.id, {
          x: startX,
          y: startY,
          facingRight: Math.random() > 0.5,
          t: i * 1.3,
          baseY: startY,
          phase: 'dart',
          pauseTimer: 0,
          dartTargetX: Math.random() * containerWidth,
          dartTargetY: startY,
          driftTargetX: Math.random() * containerWidth,
          driftTargetY: 20 + Math.random() * (containerHeight - 40),
          scatterVx: 0,
          scatterVy: 0,
          scatterTimer: 0,
        })
      }
    })
  }, [fish, containerWidth, containerHeight])

  // 點擊魚時觸發逃跑
  const scatter = useCallback((id: string) => {
    const s = stateRef.current.get(id)
    if (!s) return
    const angle = Math.random() * Math.PI * 2
    s.scatterVx = Math.cos(angle)
    s.scatterVy = Math.sin(angle)
    s.scatterTimer = 0.6 + Math.random() * 0.4 // 逃跑 0.6~1 秒
    s.facingRight = s.scatterVx > 0
  }, [])

  useEffect(() => {
    if (containerWidth <= 0 || containerHeight <= 0) return

    function clampY(y: number) {
      return Math.max(10, Math.min(containerHeight - 10, y))
    }

    function randomTarget() {
      return {
        x: 20 + Math.random() * (containerWidth - 40),
        y: clampY(20 + Math.random() * (containerHeight - 40)),
      }
    }

    function update(ts: number) {
      const dt = Math.min((ts - (lastTimeRef.current || ts)) / 1000, 0.05)
      lastTimeRef.current = ts

      const next: FishRenderState[] = []

      fish.forEach((f) => {
        const s = stateRef.current.get(f.id)
        if (!s) return

        const spd = f.speed

        // ── Scatter 優先（被點擊時逃跑）──────────────────────────
        if (s.scatterTimer > 0) {
          s.scatterTimer -= dt
          const scatterSpeed = spd * 3.5
          s.x += s.scatterVx * scatterSpeed * dt
          s.y += s.scatterVy * scatterSpeed * dt
          s.y = clampY(s.y)
          // 碰壁後反彈繼續逃
          if (s.x < 10)  { s.x = 10;  s.scatterVx = Math.abs(s.scatterVx); s.facingRight = true }
          if (s.x > containerWidth - 10) { s.x = containerWidth - 10; s.scatterVx = -Math.abs(s.scatterVx); s.facingRight = false }
          next.push({ id: f.id, x: s.x, y: s.y, facingRight: s.facingRight, opacity: 1 })
          return
        }

        // ── 正常游動 ─────────────────────────────────────────────
        switch (f.style) {
          case 'linear': {
            s.x += s.facingRight ? spd * dt : -spd * dt
            if (s.x > containerWidth - 20) { s.x = containerWidth - 20; s.facingRight = false }
            else if (s.x < 20) { s.x = 20; s.facingRight = true }
            break
          }

          case 'wave': {
            s.t += dt
            s.x += s.facingRight ? spd * 0.7 * dt : -spd * 0.7 * dt
            s.y = clampY(s.baseY + Math.sin(s.t * 1.8) * (containerHeight * 0.12))
            if (s.x > containerWidth - 20) {
              s.x = containerWidth - 20; s.facingRight = false
              s.baseY = clampY(20 + Math.random() * (containerHeight - 40))
            } else if (s.x < 20) {
              s.x = 20; s.facingRight = true
              s.baseY = clampY(20 + Math.random() * (containerHeight - 40))
            }
            break
          }

          case 'drift': {
            const dx = s.driftTargetX - s.x
            const dy = s.driftTargetY - s.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 8) {
              const t = randomTarget()
              s.driftTargetX = t.x
              s.driftTargetY = t.y
            }
            const step = spd * 0.4 * dt
            s.x += (dx / dist) * step
            s.y += (dy / dist) * step
            s.facingRight = dx > 0
            s.y = clampY(s.y)
            break
          }

          case 'dart': {
            if (s.phase === 'pause') {
              s.pauseTimer -= dt
              if (s.pauseTimer <= 0) {
                s.phase = 'dart'
                const t = randomTarget()
                s.dartTargetX = t.x
                s.dartTargetY = t.y
                s.facingRight = t.x > s.x
              }
            } else {
              const dx = s.dartTargetX - s.x
              const dy = s.dartTargetY - s.y
              const dist = Math.sqrt(dx * dx + dy * dy)
              if (dist < 6) {
                s.phase = 'pause'
                s.pauseTimer = 0.8 + Math.random() * 1.5
              } else {
                const step = spd * 2.2 * dt
                s.x += (dx / dist) * step
                s.y += (dy / dist) * step
                s.y = clampY(s.y)
              }
            }
            break
          }
        }

        s.x = Math.max(10, Math.min(containerWidth - 10, s.x))
        next.push({ id: f.id, x: s.x, y: s.y, facingRight: s.facingRight, opacity: 1 })
      })

      setRenderStates(next)
      rafRef.current = requestAnimationFrame(update)
    }

    rafRef.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafRef.current)
  }, [fish, containerWidth, containerHeight])

  return { renderStates, scatter }
}
