import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react'
import { load, type Store } from '@tauri-apps/plugin-store'
import type { AppSettings, PlantState, CreatureId, SectionHeights, ThemeMode } from '../types/settings'
import { DEFAULT_SETTINGS } from '../types/settings'

interface SettingsContextValue {
  settings: AppSettings
  loaded: boolean
  setFontSize: (v: number) => void
  setBrightness: (v: number) => void
  setThemeMode: (v: ThemeMode) => void
  setSectionHeights: (v: SectionHeights) => void
  setEnabledCreatures: (v: CreatureId[]) => void
  setShowWeather: (v: boolean) => void
  setShowFishTank: (v: boolean) => void
  setShowDate: (v: boolean) => void
  setShowPomodoro: (v: boolean) => void
  setPomodoroWorkMinutes: (v: number) => void
  setPomodoroShortBreakMinutes: (v: number) => void
  setPomodoroLongBreakMinutes: (v: number) => void
  setPomodoroSessionsPerLongBreak: (v: number) => void
  updatePlant: (updater: (prev: PlantState) => PlantState) => void
}

export const SettingsContext = createContext<SettingsContextValue>(null!)

export function useSettings() {
  return useContext(SettingsContext)
}

export function useSettingsProvider() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)
  const storeRef = useRef<Store | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const store = await load('settings.json', { autoSave: false, defaults: { settings: DEFAULT_SETTINGS } })
        storeRef.current = store
        const saved = await store.get<AppSettings & { themeLightness?: number }>('settings')
        if (saved) {
          // Migration: themeLightness (0-100) → themeMode ('dark' | 'light')
          const migratedMode: ThemeMode = saved.themeMode
            ?? (typeof saved.themeLightness === 'number' && saved.themeLightness >= 50 ? 'light' : 'dark')
          setSettings({
            ...DEFAULT_SETTINGS,
            ...saved,
            themeMode: migratedMode,
            sectionHeights: { ...DEFAULT_SETTINGS.sectionHeights, ...saved.sectionHeights },
            plant: { ...DEFAULT_SETTINGS.plant, ...saved.plant },
          })
        }
      } catch {
        // Fresh start
      }
      setLoaded(true)
    }
    init()
  }, [])

  const persist = useCallback(async (next: AppSettings) => {
    if (!storeRef.current) return
    await storeRef.current.set('settings', next)
    await storeRef.current.save()
  }, [])

  const update = useCallback((partial: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial }
      persist(next)
      return next
    })
  }, [persist])

  const setFontSize = useCallback((v: number) => update({ fontSize: Math.max(12, Math.min(20, v)) }), [update])
  const setBrightness = useCallback((v: number) => update({ brightness: Math.max(30, Math.min(100, v)) }), [update])
  const setThemeMode = useCallback((v: ThemeMode) => update({ themeMode: v }), [update])
  const setSectionHeights = useCallback((v: SectionHeights) => update({ sectionHeights: v }), [update])
  const setEnabledCreatures = useCallback((v: CreatureId[]) => update({ enabledCreatures: v }), [update])
  const setShowWeather = useCallback((v: boolean) => update({ showWeather: v }), [update])
  const setShowFishTank = useCallback((v: boolean) => update({ showFishTank: v }), [update])
  const setShowDate = useCallback((v: boolean) => update({ showDate: v }), [update])
  const setShowPomodoro = useCallback((v: boolean) => update({ showPomodoro: v }), [update])
  const setPomodoroWorkMinutes = useCallback((v: number) => update({ pomodoroWorkMinutes: Math.max(5, Math.min(60, v)) }), [update])
  const setPomodoroShortBreakMinutes = useCallback((v: number) => update({ pomodoroShortBreakMinutes: Math.max(1, Math.min(30, v)) }), [update])
  const setPomodoroLongBreakMinutes = useCallback((v: number) => update({ pomodoroLongBreakMinutes: Math.max(5, Math.min(60, v)) }), [update])
  const setPomodoroSessionsPerLongBreak = useCallback((v: number) => update({ pomodoroSessionsPerLongBreak: Math.max(2, Math.min(8, v)) }), [update])

  const updatePlant = useCallback((updater: (prev: PlantState) => PlantState) => {
    setSettings(prev => {
      const next = { ...prev, plant: updater(prev.plant) }
      persist(next)
      return next
    })
  }, [persist])

  return {
    settings,
    loaded,
    setFontSize,
    setBrightness,
    setThemeMode,
    setSectionHeights,
    setEnabledCreatures,
    setShowWeather,
    setShowFishTank,
    setShowDate,
    setShowPomodoro,
    setPomodoroWorkMinutes,
    setPomodoroShortBreakMinutes,
    setPomodoroLongBreakMinutes,
    setPomodoroSessionsPerLongBreak,
    updatePlant,
  }
}
