import { useState, useCallback, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'

import { Separator } from '@/components/ui/separator'
import { TitleBar } from '@/components/TitleBar'
import { PlantWidget } from '@/components/PlantWidget'
import { WeatherWidget } from '@/components/WeatherWidget'
import { TodoSection } from '@/components/TodoSection'
import { FishTank } from '@/components/FishTank'
import { FishOverlay } from '@/components/FishOverlay'
import { useTodos } from '@/hooks/useTodos'

const IS_OVERLAY = window.location.hash === '#overlay'

function MainWidget() {
  const { todos, loaded, addTodo, toggleTodo, deleteTodo, completionRate, total, done } = useTodos()
  const [fishActive, setFishActive] = useState(false)

  // 修正 3：當視窗從最小化還原時，重新確認 overlay 是否還存在
  useEffect(() => {
    const win = getCurrentWindow()
    const unlisten = win.listen('tauri://focus', () => {
      // overlay 若已被外部關閉，重置狀態
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

  if (!loaded) {
    return (
      <div className="widget-card items-center justify-center">
        <span className="text-xs text-white/30 animate-pulse">載入中…</span>
      </div>
    )
  }

  return (
    <div className="widget-card">
      {/* ① 標題列 */}
      <TitleBar fishActive={fishActive} onFishToggle={handleFishToggle} />

      <Separator className="bg-white/8 shrink-0 mx-2" />

      {/* ② 植物生長 */}
      <div className="widget-section">
        <PlantWidget completionRate={completionRate} total={total} done={done} />
      </div>

      <Separator className="bg-white/6 shrink-0 mx-2" />

      {/* ③ 天氣 */}
      <div className="widget-section py-1">
        <WeatherWidget />
      </div>

      {/* ④ 待辦事項 */}
      <div className="widget-section flex-1 min-h-0 flex flex-col">
        <TodoSection
          todos={todos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onAdd={addTodo}
        />
      </div>

      {/* ⑤ 水族箱 */}
      <Separator className="bg-white/6 shrink-0 mx-2" />
      <FishTank />
    </div>
  )
}

export default function App() {
  if (IS_OVERLAY) return <FishOverlay />
  return <MainWidget />
}
