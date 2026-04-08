import { useEffect, useRef, useState } from 'react'
import { listen } from '@tauri-apps/api/event'
import { FishA, FishB, Shrimp } from './FishCreatures'
import { useFishAnimation, type FishDef, type FishRenderState } from '@/hooks/useFishAnimation'

const OVERLAY_FISH: FishDef[] = [
  { id: 'of1', type: 'fishA',  style: 'linear', color: '#f97316', speed: 80,  scale: 1.3 },
  { id: 'of2', type: 'fishA',  style: 'wave',   color: '#06b6d4', speed: 60,  scale: 1.1 },
  { id: 'of3', type: 'fishB',  style: 'dart',   color: '#a78bfa', speed: 70,  scale: 1.2 },
  { id: 'of4', type: 'fishB',  style: 'wave',   color: '#f43f5e', speed: 55,  scale: 0.9 },
  { id: 'os1', type: 'shrimp', style: 'drift',  speed: 35,  scale: 1.1 },
  { id: 'os2', type: 'shrimp', style: 'drift',  speed: 28,  scale: 0.85 },
]

function renderFish(type: string, color: string | undefined, scale: number, facingRight: boolean) {
  const flip: React.CSSProperties = {
    transform: facingRight ? 'scaleX(1)' : 'scaleX(-1)',
    display: 'block',
  }
  if (type === 'fishA') return <div style={flip}><FishA color={color} scale={scale} /></div>
  if (type === 'fishB') return <div style={flip}><FishB color={color} scale={scale} /></div>
  return <div style={flip}><Shrimp scale={scale} /></div>
}

export function FishOverlay() {
  const [size, setSize] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  })

  useEffect(() => {
    function onResize() {
      setSize({ w: window.innerWidth, h: window.innerHeight })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const { renderStates, scatter } = useFishAnimation(OVERLAY_FISH, size.w, size.h)

  // 用 ref 保存最新的 renderStates，避免 listen 閉包過期
  const renderStatesRef = useRef<FishRenderState[]>([])
  useEffect(() => { renderStatesRef.current = renderStates }, [renderStates])

  // 監聽 Rust 全域滑鼠鉤子送來的點擊座標，讓附近的魚逃跑
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
    // 修正 A：整個 overlay 完全穿透，不攔截任何滑鼠事件
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
        const def = OVERLAY_FISH.find((f) => f.id === rs.id)!
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
            {renderFish(def.type, def.color, scale, rs.facingRight)}
          </div>
        )
      })}
    </div>
  )
}
