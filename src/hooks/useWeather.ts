// @ts-nocheck
import { useState, useEffect } from 'react'

export interface WeatherData {
  temp: number
  feels: number
  humidity: number
  wind: number
  code: number
}

export function weatherEmoji(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 57) return '🌧️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌧️'
  if (code <= 86) return '❄️'
  if (code <= 99) return '⛈️'
  return '🌤️'
}

export function weatherText(code: number): string {
  if (code === 0) return '맑음'
  if (code <= 3) return '구름 조금'
  if (code <= 48) return '안개'
  if (code <= 57) return '이슬비'
  if (code <= 67) return '비'
  if (code <= 77) return '눈'
  if (code <= 82) return '소나기'
  if (code <= 86) return '폭설'
  if (code <= 99) return '뇌우'
  return '흐림'
}

export function getLayerAdvice(feels: number) {
  if (feels >= 28) return { layer: 'simple', desc: '반팔 + 반바지', emoji: '☀️' }
  if (feels >= 23) return { layer: 'simple', desc: '반팔 + 긴바지', emoji: '🌤️' }
  if (feels >= 17) return { layer: 'basic', desc: '긴팔 + 긴바지', emoji: '⛅' }
  if (feels >= 12) return { layer: 'basic', desc: '자켓 or 가디건', emoji: '🍂' }
  if (feels >= 5) return { layer: 'mid_inner', desc: '코트 + 니트', emoji: '🧥' }
  return { layer: 'layered', desc: '패딩 + 기모', emoji: '❄️' }
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(() => {
    try { const c = JSON.parse(sessionStorage.getItem('_weather') || 'null'); return c } catch { return null }
  })
  const [loading, setLoading] = useState(!weather)

  useEffect(() => {
    if (weather) { setLoading(false); return }
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`)
        const data = await res.json()
        const c = data.current
        const w = { temp: Math.round(c.temperature_2m), feels: Math.round(c.apparent_temperature), humidity: c.relative_humidity_2m, wind: Math.round(c.wind_speed_10m), code: c.weather_code }
        setWeather(w)
        sessionStorage.setItem('_weather', JSON.stringify(w))
      } catch {}
      finally { setLoading(false) }
    }, () => setLoading(false), { timeout: 5000 })
  }, [])

  return { weather, loading }
}
