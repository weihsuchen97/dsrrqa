import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'

import { Separator } from '@/components/ui/separator'
import { TitleBar } from '@/components/TitleBar'
import { PlantWidget } from '@/components/PlantWidget'
import { WeatherWidget } from '@/components/WeatherWidget'
import { TodoSection } from '@/components/TodoSection'
import { FishTank } from '@/components/FishTank'
import { FishOverlay } from '@/components/FishOverlay'
import { ResizeHandles } from '@/components/ResizeHandles'
import { SettingsPanel } from '@/components/SettingsPanel'
import { UpdateNotification } from '@/components/UpdateNotification'
import { useTodos } from '@/hooks/useTodos'
import { useSettingsProvider, SettingsContext, useSettings } from '@/hooks/useSettings'

/** 根據 themeLightness (0=黑, 100=白) 計算 widget-card 的 CSS 變數 */
function useThemeVars(themeLightness: number, brightness: number, fontSize: number) {
  return useMemo(() => {
    const t = themeLightness / 100 // 0 → 1

    // 背景色: dark(15,15,20) → light(245,245,248)
    const bgR = Math.round(15 + t * 230)
    const bgG = Math.round(15 + t * 230)
    const bgB = Math.round(20 + t * 228)
    const bgA = (0.72 + t * 0.20).toFixed(2)

    // 前景/墨水色: white(255) → dark(20)
    const ink = Math.round(255 - t * 235)

    // 邊框: 淺色模式用深色半透明邊框
    const borderA = (0.08 + t * 0.04).toFixed(2)

    // 魚缸背景
    const tankDarkA = (0.5 - t * 0.3).toFixed(2)
    const tankDeepA = (0.7 - t * 0.4).toFixed(2)

    return {
      '--ink': `${ink} ${ink} ${ink}`,
      '--card-bg': `rgba(${bgR}, ${bgG}, ${bgB}, ${bgA})`,
      '--card-border': `rgba(${ink}, ${ink}, ${ink}, ${borderA})`,
      '--card-shadow-outer': `rgba(0, 0, 0, ${(0.6 - t * 0.45).toFixed(2)})`,
      '--card-shadow-inset': `rgba(${ink}, ${ink}, ${ink}, 0.04)`,
      '--tank-bg': `linear-gradient(to bottom, rgba(0,40,80,${tankDarkA}), rgba(0,20,50,${tankDeepA}))`,
      fontSize,
      filter: brightness < 100 ? `brightness(${brightness / 100})` : undefined,
    } as React.CSSProperties
  }, [themeLightness, brightness, fontSize])
}

const IS_OVERLAY = window.location.hash === '#overlay'

/* ── 區塊間拖拉分隔線 ── */
function ResizeDivider({ onDrag }: { onDrag: (deltaY: number) => void }) {
  const dragging = useRef(false)
  const lastY = useRef(0)

  function handlePointerDown(e: React.PointerEvent) {
    e.preventDefault()
    e.stopPropagation()
    dragging.current = true
    lastY.current = e.clientY
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging.current) return
    const dy = e.clientY - lastY.current
    lastY.current = e.clientY
    onDrag(dy)
  }

  function handlePointerUp() {
    dragging.current = false
  }

  return (
    <div
      className="shrink-0 mx-2 flex items-center justify-center cursor-row-resize group"
      style={{ height: 8 }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="w-8 h-0.5 rounded-full bg-white/10 group-hover:bg-white/25 transition-colors" />
    </div>
  )
}

function MainWidgetInner() {
  const { todos, loaded, addTodo, toggleTodo, deleteTodo, editTodo, editAndInsertAfter, reorderTodos, completionRate, total, done } = useTodos()
  const { settings, setSectionHeights } = useSettings()
  const [fishActive, setFishActive] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { sectionHeights } = settings
  const themeStyle = useThemeVars(settings.themeLightness, settings.brightness, settings.fontSize)

  // 修正 3：當視窗從最小化還原時，重新確認 overlay 是否還存在
  useEffect(() => {
    const win = getCurrentWindow()
    const unlisten = win.listen('tauri://focus', () => {
      invoke<boolean>('check_overlay_exists').then((exists) => {
        if (!exists) setFishActive(false)
      }).catch(() => setFishActive(false))
    })
    return () => { unlisten.then((f) => f()) }
  }, [])

  const handleFishToggle = useCallback(async () => {
    if (fishActive) {
      await invoke('destroy_overlay_window')
      setFishActive(false)
    } else {
      await invoke('create_overlay_window')
      setFishActive(true)
    }
  }, [fishActive])

  // 拖拉 handlers
  const handlePlantResize = useCallback((dy: number) => {
    setSectionHeights({ ...sectionHeights, plant: Math.max(80, Math.min(250, sectionHeights.plant + dy)) })
  }, [sectionHeights, setSectionHeights])

  const handleFishResize = useCallback((dy: number) => {
    setSectionHeights({ ...sectionHeights, fish: Math.max(50, Math.min(200, sectionHeights.fish - dy)) })
  }, [sectionHeights, setSectionHeights])

  if (!loaded) {
    return (
      <div className="widget-card items-center justify-center">
        <span className="text-xs text-white/30 animate-pulse">載入中…</span>
      </div>
    )
  }

  if (settingsOpen) {
    return (
      <>
      <ResizeHandles />
      <div className="widget-card" style={themeStyle}>
        <SettingsPanel onBack={() => setSettingsOpen(false)} />
      </div>
      </>
    )
  }

  return (
    <>
    <ResizeHandles />
    <div className="widget-card" style={themeStyle}>
      {/* ① 標題列 */}
      <TitleBar
        fishActive={fishActive}
        onFishToggle={handleFishToggle}
        onSettingsToggle={() => setSettingsOpen(true)}
      />

      <UpdateNotification />

      <Separator className="bg-white/8 shrink-0 mx-2" />

      {/* ② 植物生長 */}
      <div className="widget-section" style={{ height: sectionHeights.plant, minHeight: 80 }}>
        <PlantWidget completionRate={completionRate} total={total} done={done} />
      </div>

      <ResizeDivider onDrag={handlePlantResize} />

      {/* ③ 天氣 */}
      <div className="widget-section py-1" style={{ minHeight: sectionHeights.weather }}>
        <WeatherWidget />
      </div>

      <Separator className="bg-white/6 shrink-0 mx-2" />

      {/* ④ 待辦事項 */}
      <div className="widget-section flex-1 min-h-0 flex flex-col">
        <TodoSection
          todos={todos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onAdd={addTodo}
          onEdit={editTodo}
          onEditAndInsertAfter={editAndInsertAfter}
          onReorder={reorderTodos}
        />
      </div>

      {/* ⑤ 水族箱 */}
      <ResizeDivider onDrag={handleFishResize} />
      <FishTank height={sectionHeights.fish} />
    </div>
    </>
  )
}

function MainWidget() {
  const ctx = useSettingsProvider()
  return (
    <SettingsContext.Provider value={ctx}>
      <MainWidgetInner />
    </SettingsContext.Provider>
  )
}

export default function App() {
  if (IS_OVERLAY) return <FishOverlay />
  return <MainWidget />
}
