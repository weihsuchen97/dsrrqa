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
import { NotepadPanel } from '@/components/NotepadPanel'
import { PomodoroWidget } from '@/components/PomodoroWidget'
import { UpdateNotification } from '@/components/UpdateNotification'
import { useTodos } from '@/hooks/useTodos'
import { useSettingsProvider, SettingsContext, useSettings } from '@/hooks/useSettings'
import { useNotepad } from '@/hooks/useNotepad'
import type { ThemeMode } from '@/types/settings'

/** Auto 模式下跟隨系統主題；用 Tauri 原生 API（Windows 上比 prefers-color-scheme 可靠） */
function useResolvedThemeMode(mode: ThemeMode): 'dark' | 'light' {
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    let unlisten: (() => void) | undefined
    let cancelled = false
    const win = getCurrentWindow()
    win.theme().then((t) => {
      if (!cancelled && t) setSystemTheme(t)
    }).catch(() => {})
    win.onThemeChanged(({ payload }) => {
      if (!cancelled) setSystemTheme(payload)
    }).then((fn) => { if (cancelled) fn(); else unlisten = fn })
    return () => {
      cancelled = true
      unlisten?.()
    }
  }, [])

  if (mode === 'auto') return systemTheme
  return mode
}

/** 依 themeMode 產生 widget-card 要套用的 data-theme 與 inline style */
function useThemeAttrs(themeMode: ThemeMode, brightness: number, fontSize: number) {
  const resolved = useResolvedThemeMode(themeMode)
  const style = useMemo(() => ({
    fontSize,
    filter: brightness < 100 ? `brightness(${brightness / 100})` : undefined,
  } as React.CSSProperties), [brightness, fontSize])
  return { dataTheme: resolved, style }
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
      className="shrink-0 mx-2.5 flex items-center justify-center cursor-row-resize group"
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
  const { todos, loaded, addTodo, toggleTodo, deleteTodo, editTodo, setTodoPriority, editAndInsertAfter, reorderTodos, completionRate, total, done } = useTodos()
  const { settings, setSectionHeights } = useSettings()
  const notepad = useNotepad()
  const [fishActive, setFishActive] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notepadOpen, setNotepadOpen] = useState(false)

  const { sectionHeights } = settings
  const { dataTheme, style: themeStyle } = useThemeAttrs(settings.themeMode, settings.brightness, settings.fontSize)

  const handleNotepadToggle = useCallback(() => {
    setNotepadOpen((v) => !v)
  }, [])

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
    setSectionHeights({ ...sectionHeights, plant: Math.max(100, Math.min(260, sectionHeights.plant + dy)) })
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

  const mainCard = settingsOpen ? (
    <div className="widget-card" data-theme={dataTheme} style={themeStyle}>
      <SettingsPanel onBack={() => setSettingsOpen(false)} />
    </div>
  ) : (
    <div className="widget-card" data-theme={dataTheme} style={themeStyle}>
      {/* ① 標題列 */}
      <TitleBar
        fishActive={fishActive}
        onFishToggle={handleFishToggle}
        onSettingsToggle={() => setSettingsOpen(true)}
        notepadActive={notepadOpen}
        onNotepadToggle={handleNotepadToggle}
        showDate={settings.showDate}
      />

      <UpdateNotification />

      <Separator className="bg-white/15 shrink-0 mx-2.5 my-1.5" />

      {/* ② 植物生長 */}
      <div className="widget-section pt-3 pb-1" style={{ height: sectionHeights.plant, minHeight: 80 }}>
        <PlantWidget completionRate={completionRate} total={total} done={done} />
      </div>

      <ResizeDivider onDrag={handlePlantResize} />

      {/* ③ 天氣 */}
      {settings.showWeather && (
        <>
          <div className="widget-section py-1" style={{ minHeight: sectionHeights.weather }}>
            <WeatherWidget />
          </div>
          <Separator className="bg-white/6 shrink-0 mx-2.5" />
        </>
      )}

      {/* ④ 番茄鐘 */}
      {settings.showPomodoro && (
        <>
          <PomodoroWidget />
          <Separator className="bg-white/6 shrink-0 mx-2.5" />
        </>
      )}

      {/* ⑤ 待辦事項 / 記事本（同一空間切換） */}
      <div className="widget-section flex-1 min-h-0 flex flex-col">
        {notepadOpen ? (
          <NotepadPanel content={notepad.content} onContentChange={notepad.setContent} />
        ) : (
          <TodoSection
            todos={todos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onAdd={addTodo}
            onEdit={editTodo}
            onSetPriority={setTodoPriority}
            onEditAndInsertAfter={editAndInsertAfter}
            onReorder={reorderTodos}
          />
        )}
      </div>

      {/* ⑤ 水族箱 */}
      {settings.showFishTank && (
        <>
          <ResizeDivider onDrag={handleFishResize} />
          <FishTank height={sectionHeights.fish} />
        </>
      )}
    </div>
  )

  return (
    <>
      <ResizeHandles />
      {mainCard}
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
