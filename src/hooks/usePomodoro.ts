import { useState, useEffect, useCallback, useRef } from 'react'

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak'

const MODE_LABELS: Record<PomodoroMode, string> = {
  work:       '專注中',
  shortBreak: '短暫休息',
  longBreak:  '長休息',
}

function sendNotification(mode: PomodoroMode) {
  const msg = mode === 'work' ? '🍅 番茄鐘完成！開始休息吧' : '⏰ 休息結束，繼續專注！'
  if (Notification.permission === 'granted') {
    new Notification('DSRRQA', { body: msg, silent: false })
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') new Notification('DSRRQA', { body: msg, silent: false })
    })
  }
}

export function usePomodoro(
  workMin: number,
  shortBreakMin: number,
  longBreakMin: number,
  sessionsPerLong: number,
  onWorkComplete?: () => void,
) {
  const [mode, setMode] = useState<PomodoroMode>('work')
  const [secondsLeft, setSecondsLeft] = useState(workMin * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)

  // Track current settings so interval closure stays fresh
  const workSecRef = useRef(workMin * 60)
  const shortSecRef = useRef(shortBreakMin * 60)
  const longSecRef = useRef(longBreakMin * 60)
  const sessionsRef = useRef(sessionsPerLong)
  const sessionCountRef = useRef(sessionCount)
  const modeRef = useRef(mode)

  useEffect(() => { workSecRef.current = workMin * 60 }, [workMin])
  useEffect(() => { shortSecRef.current = shortBreakMin * 60 }, [shortBreakMin])
  useEffect(() => { longSecRef.current = longBreakMin * 60 }, [longBreakMin])
  useEffect(() => { sessionsRef.current = sessionsPerLong }, [sessionsPerLong])
  useEffect(() => { sessionCountRef.current = sessionCount }, [sessionCount])
  useEffect(() => { modeRef.current = mode }, [mode])

  const advanceMode = useCallback(() => {
    const currentMode = modeRef.current
    const currentCount = sessionCountRef.current

    if (currentMode === 'work') {
      const newCount = currentCount + 1
      setSessionCount(newCount)
      sessionCountRef.current = newCount
      onWorkComplete?.()
      const isLong = newCount % sessionsRef.current === 0
      const nextMode: PomodoroMode = isLong ? 'longBreak' : 'shortBreak'
      setMode(nextMode)
      modeRef.current = nextMode
      setSecondsLeft(isLong ? longSecRef.current : shortSecRef.current)
      sendNotification('work')
    } else {
      setMode('work')
      modeRef.current = 'work'
      setSecondsLeft(workSecRef.current)
      sendNotification(currentMode)
    }
    setIsRunning(false)
  }, [onWorkComplete])

  useEffect(() => {
    if (!isRunning) return
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id)
          advanceMode()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [isRunning, advanceMode])

  // Reset timer when settings change while paused
  useEffect(() => {
    if (isRunning) return
    const secs = mode === 'work' ? workMin * 60 : mode === 'shortBreak' ? shortBreakMin * 60 : longBreakMin * 60
    setSecondsLeft(secs)
  }, [workMin, shortBreakMin, longBreakMin, mode, isRunning])

  const start  = useCallback(() => setIsRunning(true), [])
  const pause  = useCallback(() => setIsRunning(false), [])
  const reset  = useCallback(() => {
    setIsRunning(false)
    const secs = modeRef.current === 'work' ? workSecRef.current : modeRef.current === 'shortBreak' ? shortSecRef.current : longSecRef.current
    setSecondsLeft(secs)
  }, [])
  const skip   = useCallback(() => {
    setIsRunning(false)
    advanceMode()
  }, [advanceMode])

  const modeLabel = MODE_LABELS[mode]
  const totalSeconds = mode === 'work' ? workMin * 60 : mode === 'shortBreak' ? shortBreakMin * 60 : longBreakMin * 60
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  return { mode, modeLabel, timeDisplay: `${mm}:${ss}`, progress, isRunning, sessionCount, start, pause, reset, skip }
}
