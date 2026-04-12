import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react'
import { load, type Store } from '@tauri-apps/plugin-store'
import type { AppSettings, PlantState, CreatureId, SectionHeights } from '../types/settings'
import { DEFAULT_SETTINGS } from '../types/settings'

interface SettingsContextValue {
  settings: AppSettings
  loaded: boolean
  setFontSize: (v: number) => void
  setBrightness: (v: number) => void
  setThemeLightness: (v: number) => void
  setSectionHeights: (v: SectionHeights) => void
  setEnabledCreatures: (v: CreatureId[]) => void
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
        const saved = await store.get<AppSettings>('settings')
        if (saved) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...saved,
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
  const setThemeLightness = useCallback((v: number) => update({ themeLightness: Math.max(0, Math.min(100, v)) }), [update])
  const setSectionHeights = useCallback((v: SectionHeights) => update({ sectionHeights: v }), [update])
  const setEnabledCreatures = useCallback((v: CreatureId[]) => update({ enabledCreatures: v }), [update])

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
    setThemeLightness,
    setSectionHeights,
    setEnabledCreatures,
    updatePlant,
  }
}
