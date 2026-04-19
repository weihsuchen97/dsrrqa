import { getCurrentWindow } from '@tauri-apps/api/window'
import { useSettings } from '@/hooks/useSettings'
import { CREATURE_CONFIG, PLANT_SPECIES_CONFIG, type CreatureId, type PlantSpecies, type ThemeMode } from '@/types/settings'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

const THEME_OPTIONS: { value: ThemeMode; label: string; emoji: string }[] = [
  { value: 'dark',  label: '深色', emoji: '🌙' },
  { value: 'light', label: '淺色', emoji: '☀️' },
  { value: 'auto',  label: '跟隨系統', emoji: '🖥️' },
]

const ALL_CREATURES = Object.keys(CREATURE_CONFIG) as CreatureId[]
const ALL_PLANTS = Object.keys(PLANT_SPECIES_CONFIG) as PlantSpecies[]

interface SettingsPanelProps {
  onBack: () => void
}

function SliderRow({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-xs text-white/40 font-mono">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-400
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-300/50"
      />
    </div>
  )
}

function ToggleRow({ label, emoji, checked, onChange }: {
  label: string; emoji: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between py-1.5 px-2 rounded-lg border transition-all
        ${checked
          ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
          : 'bg-transparent border-white/8 text-white/40 hover:border-white/20 hover:text-white/60'
        }`}
    >
      <span className="flex items-center gap-1.5">
        <span className="text-sm">{emoji}</span>
        <span className="text-xs">{label}</span>
      </span>
      <span
        className={`relative inline-block w-7 h-4 rounded-full transition-colors
          ${checked ? 'bg-blue-500/80' : 'bg-white/15'}`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all
            ${checked ? 'left-3.5' : 'left-0.5'}`}
        />
      </span>
    </button>
  )
}

export function SettingsPanel({ onBack }: SettingsPanelProps) {
  const { settings, setFontSize, setBrightness, setThemeMode, setEnabledCreatures, setShowWeather, setShowFishTank, setShowDate, updatePlant } = useSettings()

  function toggleCreature(id: CreatureId) {
    const current = settings.enabledCreatures
    if (current.includes(id)) {
      if (current.length <= 1) return
      setEnabledCreatures(current.filter(c => c !== id))
    } else {
      setEnabledCreatures([...current, id])
    }
  }

  function selectPlant(species: PlantSpecies) {
    if (species === settings.plant.species) return
    updatePlant(prev => ({ ...prev, species }))
  }

  async function handleDragStart(e: React.MouseEvent) {
    if (e.button !== 0) return
    e.preventDefault()
    await getCurrentWindow().startDragging()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button */}
      <div
        className="flex items-center gap-2 px-3 py-2 shrink-0 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleDragStart}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onBack() }}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-6 h-6 rounded flex items-center justify-center text-white/50 hover:text-white/90 hover:bg-white/10 transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 1L3 6l5 5" />
          </svg>
        </button>
        <span className="text-xs font-semibold tracking-widest text-white/50">設定</span>
      </div>

      <Separator className="bg-white/8 shrink-0 mx-2" />

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 py-3 flex flex-col gap-4">
          {/* ── 顯示設定 ── */}
          <div>
            <h3 className="text-xs font-semibold text-white/70 mb-2">顯示</h3>
            <div className="flex flex-col gap-3">
              <SliderRow
                label="字體大小" value={settings.fontSize}
                min={12} max={20} step={1} unit="px"
                onChange={setFontSize}
              />
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-white/60">主題</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {THEME_OPTIONS.map(opt => {
                    const active = settings.themeMode === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setThemeMode(opt.value)}
                        className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg border transition-all text-center
                          ${active
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                            : 'bg-transparent border-white/8 text-white/40 hover:border-white/20 hover:text-white/60'
                          }`}
                      >
                        <span className="text-base">{opt.emoji}</span>
                        <span className="text-[10px] leading-tight">{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <SliderRow
                label="亮度" value={settings.brightness}
                min={30} max={100} step={5} unit="%"
                onChange={setBrightness}
              />
            </div>
          </div>

          <Separator className="bg-white/8" />

          {/* ── 元件顯示 ── */}
          <div>
            <h3 className="text-xs font-semibold text-white/70 mb-2">元件顯示</h3>
            <div className="flex flex-col gap-1.5">
              <ToggleRow
                label="日期"
                emoji="📅"
                checked={settings.showDate}
                onChange={setShowDate}
              />
              <ToggleRow
                label="天氣"
                emoji="🌤️"
                checked={settings.showWeather}
                onChange={setShowWeather}
              />
              <ToggleRow
                label="水族箱"
                emoji="🐠"
                checked={settings.showFishTank}
                onChange={setShowFishTank}
              />
            </div>
          </div>

          <Separator className="bg-white/8" />

          {/* ── 植物選擇 ── */}
          <div>
            <h3 className="text-xs font-semibold text-white/70 mb-2">植物種類</h3>
            <div className="grid grid-cols-3 gap-1.5">
              {ALL_PLANTS.map(species => {
                const cfg = PLANT_SPECIES_CONFIG[species]
                const active = settings.plant.species === species
                return (
                  <button
                    key={species}
                    onClick={() => selectPlant(species)}
                    className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg border transition-all text-center
                      ${active
                        ? 'bg-green-500/20 border-green-500/50 text-green-300'
                        : 'bg-transparent border-white/8 text-white/40 hover:border-white/20 hover:text-white/60'
                      }`}
                  >
                    <span className="text-base">{cfg.emoji}</span>
                    <span className="text-[10px] leading-tight">{cfg.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <Separator className="bg-white/8" />

          {/* ── 生物選擇 ── */}
          <div>
            <h3 className="text-xs font-semibold text-white/70 mb-2">水族箱生物</h3>
            <p className="text-[10px] text-white/30 mb-2">點選啟用/停用（至少保留 1 種）</p>
            <div className="grid grid-cols-2 gap-1.5">
              {ALL_CREATURES.map(id => {
                const cfg = CREATURE_CONFIG[id]
                const active = settings.enabledCreatures.includes(id)
                return (
                  <button
                    key={id}
                    onClick={() => toggleCreature(id)}
                    className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg border transition-all
                      ${active
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'bg-transparent border-white/8 text-white/30 hover:border-white/20 hover:text-white/50'
                      }`}
                  >
                    <span className="text-sm">{cfg.emoji}</span>
                    <span className="text-[10px]">{cfg.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="h-2" />
        </div>
      </ScrollArea>
    </div>
  )
}
