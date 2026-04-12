import { useEffect, useRef, useState, useMemo } from 'react'
import { listen } from '@tauri-apps/api/event'
import { load } from '@tauri-apps/plugin-store'
import { renderCreatureById } from './FishCreatures'
import { useFishAnimation, type FishDef, type FishRenderState } from '@/hooks/useFishAnimation'
import type { CreatureId, AppSettings } from '@/types/settings'
import { DEFAULT_SETTINGS } from '@/types/settings'

const SWIM_STYLES: Array<FishDef['style']> = ['linear', 'wave', 'dart', 'drift']
const SPEEDS = [80, 60, 70, 55, 35, 28, 75, 50, 65, 45]

function buildOverlayDefs(creatures: CreatureId[]): FishDef[] {
  return creatures.map((id, i) => ({
    id: `overlay-${id}-${i}`,
    type: id,
    style: SWIM_STYLES[i % SWIM_STYLES.length],
    speed: SPEEDS[i % SPEEDS.length],
    scale: 0.9 + Math.random() * 0.5,
  }))
}

export function FishOverlay() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  const [creatures, setCreatures] = useState<CreatureId[]>(DEFAULT_SETTINGS.enabledCreatures)

  // Load settings for overlay window (separate context, no shared React state)
  useEffect(() => {
    async function loadSettings() {
      try {
        const store = await load('settings.json', { autoSave: false, defaults: { settings: DEFAULT_SETTINGS } })
        const saved = await store.get<AppSettings>('settings')
        if (saved?.enabledCreatures?.length) {
          setCreatures(saved.enabledCreatures)
        }
      } catch {
        // Use defaults
      }
    }
    loadSettings()
  }, [])

  useEffect(() => {
    function onResize() {
      setSize({ w: window.innerWidth, h: window.innerHeight })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const fishDefs = useMemo(() => buildOverlayDefs(creatures), [creatures])
  const { renderStates, scatter } = useFishAnimation(fishDefs, size.w, size.h)

  const renderStatesRef = useRef<FishRenderState[]>([])
  useEffect(() => { renderStatesRef.current = renderStates }, [renderStates])

  useEffect(() => {
    const unlisten = listen<{ x: number; y: number }>('fish-click', (e) => {
      const { x, y } = e.payload
      renderStatesRef.current.forEach((rs) => {
        const dx = rs.x - x
        const dy = rs.y - y
        if (Math.sqrt(dx * dx + dy * dy) < 80) {
          scatter(rs.id)
        }
      })
    })
    return () => { unlisten.then((f) => f()) }
  }, [scatter])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: size.w,
        height: size.h,
        background: 'transparent',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {renderStates.map((rs) => {
        const def = fishDefs.find((f) => f.id === rs.id)
        if (!def) return null
        const scale = def.scale ?? 1
        return (
          <div
            key={rs.id}
            style={{
              position: 'absolute',
              left: rs.x,
              top: rs.y,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
              opacity: rs.opacity,
            }}
          >
            {renderCreatureById(def.type, scale, rs.facingRight, def.color)}
          </div>
        )
      })}
    </div>
  )
}
