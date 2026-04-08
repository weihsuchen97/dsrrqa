import { useState, useEffect } from 'react'

export interface WeatherData {
  city: string
  temperature: number
  description: string
  emoji: string
}

// WMO Weather Code mapping → Traditional Chinese
const WMO: Record<number, { desc: string; emoji: string }> = {
  0:  { desc: '晴天',     emoji: '☀️' },
  1:  { desc: '大致晴朗', emoji: '🌤️' },
  2:  { desc: '部分多雲', emoji: '⛅' },
  3:  { desc: '陰天',     emoji: '☁️' },
  45: { desc: '有霧',     emoji: '🌫️' },
  48: { desc: '霧凇',     emoji: '🌫️' },
  51: { desc: '細雨',     emoji: '🌦️' },
  53: { desc: '毛毛雨',   emoji: '🌦️' },
  55: { desc: '濃密細雨', emoji: '🌧️' },
  61: { desc: '小雨',     emoji: '🌧️' },
  63: { desc: '中雨',     emoji: '🌧️' },
  65: { desc: '大雨',     emoji: '🌧️' },
  71: { desc: '小雪',     emoji: '🌨️' },
  73: { desc: '中雪',     emoji: '🌨️' },
  75: { desc: '大雪',     emoji: '❄️' },
  77: { desc: '冰晶',     emoji: '❄️' },
  80: { desc: '陣雨',     emoji: '🌦️' },
  81: { desc: '中等陣雨', emoji: '🌧️' },
  82: { desc: '大陣雨',   emoji: '⛈️' },
  85: { desc: '陣雪',     emoji: '🌨️' },
  86: { desc: '大陣雪',   emoji: '❄️' },
  95: { desc: '雷雨',     emoji: '⛈️' },
  96: { desc: '雷陣雨',   emoji: '⛈️' },
  99: { desc: '強雷雨',   emoji: '🌩️' },
}

function getWeatherInfo(code: number) {
  return WMO[code] ?? { desc: '未知天氣', emoji: '🌡️' }
}

async function fetchWeatherData(): Promise<WeatherData> {
  const locRes = await fetch('http://ip-api.com/json?fields=city,lat,lon')
  const loc = await locRes.json()

  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,weather_code`
  )
  const data = await weatherRes.json()
  const { temperature_2m, weather_code } = data.current
  const { desc, emoji } = getWeatherInfo(weather_code)

  return {
    city: loc.city,
    temperature: Math.round(temperature_2m),
    description: desc,
    emoji,
  }
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true

    async function update() {
      try {
        const data = await fetchWeatherData()
        if (alive) {
          setWeather(data)
          setError(false)
        }
      } catch {
        if (alive) setError(true)
      }
    }

    update()
    const id = setInterval(update, 30 * 60 * 1000) // refresh every 30 min
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  return { weather, error }
}
