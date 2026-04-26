import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface TitleBarProps {
  fishActive: boolean
  onFishToggle: () => void
  onSettingsToggle?: () => void
  notepadActive?: boolean
  onNotepadToggle?: () => void
  showDate?: boolean
}

const WEEKDAY_ZH = ['日', '一', '二', '三', '四', '五', '六']

function formatDate(d: Date) {
  return `${d.getMonth() + 1}月${d.getDate()}日 週${WEEKDAY_ZH[d.getDay()]}`
}

function msUntilNextMidnight() {
  const now = new Date()
  const next = new Date(now)
  next.setHours(24, 0, 0, 50) // 多 50ms 緩衝，確保跨進下一天
  return next.getTime() - now.getTime()
}

function useTodayLabel() {
  const [label, setLabel] = useState(() => formatDate(new Date()))
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const refresh = () => {
      setLabel(formatDate(new Date()))
      timer = setTimeout(refresh, msUntilNextMidnight())
    }
    timer = setTimeout(refresh, msUntilNextMidnight())
    // 睡眠/喚醒、重新聚焦時補一次校正
    const onFocus = () => setLabel(formatDate(new Date()))
    window.addEventListener('focus', onFocus)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('focus', onFocus)
    }
  }, [])
  return label
}

export function TitleBar({ fishActive, onFishToggle, onSettingsToggle, notepadActive, onNotepadToggle, showDate }: TitleBarProps) {
  const dateLabel = useTodayLabel()
  async function handleDragStart(e: React.MouseEvent) {
    if (e.button !== 0) return
    e.preventDefault()
    await getCurrentWindow().startDragging()
  }

  async function handleMinimize(e: React.MouseEvent) {
    e.stopPropagation()
    await getCurrentWindow().minimize()
  }

  async function handleHide(e: React.MouseEvent) {
    e.stopPropagation()
    await invoke('hide_main_window')
  }

  return (
    <div
      className="flex items-center justify-between px-3 py-2 shrink-0 cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleDragStart}
    >
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="text-[11px] font-semibold tracking-widest text-white/55 uppercase">
          DSRRQA
        </span>
        {showDate && (
          <span className="text-[11px] text-white/45 truncate">
            {dateLabel}
          </span>
        )}
      </div>

      <div
        className="flex items-center gap-1.5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Notepad toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => { e.stopPropagation(); onNotepadToggle?.() }}
              className={`w-6 h-6 rounded flex items-center justify-center transition-all
                ${notepadActive
                  ? 'bg-amber-400/25 text-amber-200'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/10'
                }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="13" y2="17" />
              </svg>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{notepadActive ? '切換到待辦事項' : '切換到記事本'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => { e.stopPropagation(); onSettingsToggle?.() }}
              className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p>設定</p></TooltipContent>
        </Tooltip>

        {/* Fish overlay toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => { e.stopPropagation(); onFishToggle() }}
              className={`w-6 h-6 rounded flex items-center justify-center text-sm transition-all
                ${fishActive
                  ? 'bg-blue-500/30 text-blue-300'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/10'
                }`}
            >
              🐠
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{fishActive ? '關閉全螢幕水族箱' : '開啟全螢幕水族箱'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Minimize */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleMinimize}
              className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
            >
              <svg width="10" height="2" viewBox="0 0 10 2" fill="currentColor">
                <rect width="10" height="2" rx="1" />
              </svg>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p>最小化</p></TooltipContent>
        </Tooltip>

        {/* Hide to tray */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleHide}
              className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 1l8 8M9 1l-8 8" />
              </svg>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p>隱藏至托盤</p></TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
