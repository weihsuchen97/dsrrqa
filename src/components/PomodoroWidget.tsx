import { useSettings } from '@/hooks/useSettings'
import { usePomodoro, type PomodoroMode } from '@/hooks/usePomodoro'

const RING_R = 36
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R

const MODE_COLOR: Record<PomodoroMode, string> = {
  work:       'text-red-400',
  shortBreak: 'text-emerald-400',
  longBreak:  'text-blue-400',
}

const RING_COLOR: Record<PomodoroMode, string> = {
  work:       'stroke-red-400',
  shortBreak: 'stroke-emerald-400',
  longBreak:  'stroke-blue-400',
}

function ControlBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] text-white/60 hover:text-white/90 hover:bg-white/10 transition-colors select-none"
    >
      {children}
    </button>
  )
}

export function PomodoroWidget() {
  const { settings, updatePlant } = useSettings()

  const onWorkComplete = () => {
    updatePlant((prev) => ({ ...prev, experience: Math.min(100, prev.experience + 5) }))
  }

  const {
    mode, modeLabel, timeDisplay, progress, isRunning, sessionCount,
    start, pause, reset, skip,
  } = usePomodoro(
    settings.pomodoroWorkMinutes,
    settings.pomodoroShortBreakMinutes,
    settings.pomodoroLongBreakMinutes,
    settings.pomodoroSessionsPerLongBreak,
    onWorkComplete,
  )

  const ringOffset = RING_CIRCUMFERENCE * (1 - progress)
  const colorClass = MODE_COLOR[mode]
  const ringClass  = RING_COLOR[mode]

  return (
    <div className="flex flex-col items-center gap-2 py-2 px-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <span className="text-[11px] font-semibold text-white/55 tracking-widest uppercase">番茄鐘</span>
        <span className="text-[11px] text-white/40">
          今日 <span className="text-white/65 font-medium">{sessionCount}</span> 個 🍅
        </span>
      </div>

      {/* Ring + time */}
      <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
        <svg width={96} height={96} viewBox="0 0 96 96" className="absolute inset-0 -rotate-90">
          {/* Track */}
          <circle
            cx={48} cy={48} r={RING_R}
            fill="none"
            stroke="currentColor"
            strokeWidth={5}
            className="text-white/8"
          />
          {/* Progress */}
          <circle
            cx={48} cy={48} r={RING_R}
            fill="none"
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={ringOffset}
            className={`${ringClass} transition-all duration-1000`}
          />
        </svg>
        <div className="flex flex-col items-center gap-0.5 z-10">
          <span className={`text-2xl font-mono font-semibold tabular-nums leading-none ${colorClass}`}>
            {timeDisplay}
          </span>
          <span className="text-[10px] text-white/45 leading-none">{modeLabel}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-0.5">
        <ControlBtn onClick={isRunning ? pause : start} title={isRunning ? '暫停' : '開始'}>
          {isRunning ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <rect x="1" y="1" width="3" height="8" rx="1" />
              <rect x="6" y="1" width="3" height="8" rx="1" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M2 1l7 4-7 4V1z" />
            </svg>
          )}
          {isRunning ? '暫停' : '開始'}
        </ControlBtn>

        <ControlBtn onClick={reset} title="重置">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M8.5 5a3.5 3.5 0 1 1-1-2.45" />
            <path d="M8.5 1.5V4H6" />
          </svg>
          重置
        </ControlBtn>

        <ControlBtn onClick={skip} title="跳過">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M1.5 2L6 5l-4.5 3V2z" />
            <rect x="7" y="2" width="1.5" height="6" rx="0.5" />
          </svg>
          跳過
        </ControlBtn>
      </div>
    </div>
  )
}
