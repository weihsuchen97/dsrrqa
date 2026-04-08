import { invoke } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface TitleBarProps {
  fishActive: boolean
  onFishToggle: () => void
}

export function TitleBar({ fishActive, onFishToggle }: TitleBarProps) {
  async function handleDragStart(e: React.MouseEvent) {
    if (e.button !== 0) return
    e.preventDefault()
    await getCurrentWindow().startDragging()
  }

  async function handleMinimize(e: React.MouseEvent) {
    e.stopPropagation()
    await getCurrentWindow().minimize()
  }

  // 修正 C：× 按鈕真正關閉 APP
  async function handleClose(e: React.MouseEvent) {
    e.stopPropagation()
    await invoke('quit_app')
  }

  return (
    <div
      className="flex items-center justify-between px-3 py-2 shrink-0 cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleDragStart}
    >
      <span className="text-xs font-semibold tracking-widest text-white/50">
        DSRRQA
      </span>

      <div
        className="flex items-center gap-1"
        onMouseDown={(e) => e.stopPropagation()}
      >
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

        {/* Close APP */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleClose}
              className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 1l8 8M9 1l-8 8" />
              </svg>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom"><p>關閉</p></TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
