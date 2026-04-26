export type CreatureId =
  | 'fish-tropical' | 'fish-blowfish' | 'fish-angel' | 'fish-clown'
  | 'fish-betta' | 'fish-goldfish' | 'fish-koi'
  | 'cat' | 'dog' | 'pig'

export type PlantSpecies = 'succulent' | 'sunflower' | 'sakura' | 'cactus' | 'bonsai'

export type ThemeMode = 'dark' | 'light' | 'auto'

export interface PlantState {
  species: PlantSpecies
  experience: number    // 0–100, drives growth stage
  water: number         // 0–100, depletes over time
  sunlight: number      // 0–100, depletes over time
  lastWatered: string   // ISO string
  lastSunlight: string  // ISO string
  createdAt: string     // ISO string
}

export interface SectionHeights {
  plant: number    // px
  weather: number  // px
  todo: number     // flex ratio (1 = default)
  fish: number     // px
}

export interface AppSettings {
  fontSize: number           // 12–20
  brightness: number         // 30–100 (percentage)
  themeMode: ThemeMode       // 'dark' | 'light' | 'auto'
  sectionHeights: SectionHeights
  enabledCreatures: CreatureId[]
  plant: PlantState
  showWeather: boolean
  showFishTank: boolean
  showDate: boolean
  showPomodoro: boolean
  pomodoroWorkMinutes: number
  pomodoroShortBreakMinutes: number
  pomodoroLongBreakMinutes: number
  pomodoroSessionsPerLongBreak: number
}

export const DEFAULT_PLANT: PlantState = {
  species: 'succulent',
  experience: 0,
  water: 80,
  sunlight: 80,
  lastWatered: new Date().toISOString(),
  lastSunlight: new Date().toISOString(),
  createdAt: new Date().toISOString(),
}

export const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 14,
  brightness: 100,
  themeMode: 'dark',
  sectionHeights: {
    plant: 148,
    weather: 56,
    todo: 1,
    fish: 82,
  },
  enabledCreatures: ['fish-tropical', 'fish-blowfish', 'fish-angel', 'fish-clown'],
  plant: DEFAULT_PLANT,
  showWeather: true,
  showFishTank: true,
  showDate: true,
  showPomodoro: false,
  pomodoroWorkMinutes: 25,
  pomodoroShortBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
  pomodoroSessionsPerLongBreak: 4,
}

export const PLANT_SPECIES_CONFIG: Record<PlantSpecies, { name: string; emoji: string }> = {
  succulent:  { name: '多肉植物', emoji: '🪴' },
  sunflower:  { name: '向日葵',   emoji: '🌻' },
  sakura:     { name: '櫻花',     emoji: '🌸' },
  cactus:     { name: '仙人掌',   emoji: '🌵' },
  bonsai:     { name: '盆栽',     emoji: '🌳' },
}

export const CREATURE_CONFIG: Record<CreatureId, { name: string; emoji: string }> = {
  'fish-tropical': { name: '熱帶魚',   emoji: '🐠' },
  'fish-blowfish': { name: '河豚',     emoji: '🐡' },
  'fish-angel':    { name: '神仙魚',   emoji: '🐟' },
  'fish-clown':    { name: '小丑魚',   emoji: '🤡' },
  'fish-betta':    { name: '鬥魚',     emoji: '🐠' },
  'fish-goldfish': { name: '金魚',     emoji: '🐟' },
  'fish-koi':      { name: '錦鯉',     emoji: '🎏' },
  'cat':           { name: '貓咪',     emoji: '🐱' },
  'dog':           { name: '小狗',     emoji: '🐶' },
  'pig':           { name: '小豬',     emoji: '🐷' },
}
