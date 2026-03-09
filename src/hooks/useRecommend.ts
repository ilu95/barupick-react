// @ts-nocheck
import { useState, useCallback } from 'react'
import { COLORS_60 } from '@/lib/colors'
import { MOOD_GROUPS, LAYER_LEVELS, STYLE_GUIDE } from '@/lib/styles'
import { STYLE_MOODS } from '@/lib/styleMoods'
import { PERSONAL_COLOR_12, FACE_NEAR_ITEMS } from '@/lib/personalColor'
import { BODY_GUIDE_DATA } from '@/lib/bodyType'
import { profile } from '@/lib/profile'

// @ts-nocheck
// 추천 엔진 함수 import — recommend.ts에서 export 필요
// 현재는 인라인으로 처리 (추후 리팩토링)

export type RecStep = 'mood' | 'style' | 'layer' | 'garment' | 'pin' | 'results' | 'detail'

export interface ComboResult {
  outfit: Record<string, string>
  name: string
  score: number
  tags?: string[]
  tip?: string
  style?: string
}

export interface RecState {
  mood: string | null
  style: string | null
  layerType: string
  outerType: 'coat' | 'jacket' | 'padding'
  midType: 'knit' | 'cardigan' | 'vest'
  pinned: Record<string, string>
  results: ComboResult[]
  weatherLayerLocked: boolean
  detailIdx: number
  fitMode: boolean
}

const initialState: RecState = {
  mood: null,
  style: null,
  layerType: 'basic',
  outerType: 'coat',
  midType: 'knit',
  pinned: {},
  results: [],
  weatherLayerLocked: false,
  detailIdx: 0,
  fitMode: false,
}

export function useRecommend() {
  const [step, setStep] = useState<RecStep>('mood')
  const [state, setState] = useState<RecState>(initialState)
  const [history, setHistory] = useState<RecStep[]>([])

  const pushStep = useCallback((next: RecStep) => {
    setHistory(prev => [...prev, step])
    setStep(next)
  }, [step])

  const goBack = useCallback(() => {
    setHistory(prev => {
      const copy = [...prev]
      const last = copy.pop()
      if (last) setStep(last)
      return copy
    })
  }, [])

  const update = useCallback((partial: Partial<RecState>) => {
    setState(prev => ({ ...prev, ...partial }))
  }, [])

  // 무드 선택
  const selectMood = useCallback((mood: string | null) => {
    update({ mood })
    if (mood) {
      pushStep('style')
    } else {
      // "전체에서 추천"
      if (state.weatherLayerLocked) {
        generateAndGo()
      } else {
        pushStep('layer')
      }
    }
  }, [state.weatherLayerLocked])

  // 스타일 선택
  const selectStyle = useCallback((style: string | null) => {
    update({ style })
    if (state.weatherLayerLocked) {
      // 날씨 자동설정 → 바로 결과
      setTimeout(() => generateAndGoWithState({ ...state, style }), 0)
    } else {
      pushStep('layer')
    }
  }, [state])

  // 레이어 선택
  const selectLayer = useCallback((layerType: string) => {
    update({ layerType })
    const pk = LAYER_LEVELS[layerType]?.partKeys || []
    const hasOuter = pk.includes('outer')
    const hasMid = pk.includes('middleware')
    if (hasOuter || hasMid) {
      pushStep('garment')
    } else {
      setTimeout(() => generateAndGoWithState({ ...state, layerType }), 0)
    }
  }, [state])

  // 옷 종류 설정
  const setGarment = useCallback((type: 'outerType' | 'midType', value: string) => {
    update({ [type]: value } as any)
  }, [])

  // 옷 종류 확인 → 결과
  const confirmGarment = useCallback(() => {
    generateAndGoWithState(state)
  }, [state])

  // 핀 토글
  const togglePin = useCallback((part: string, colorKey: string) => {
    setState(prev => {
      const pinned = { ...prev.pinned }
      if (pinned[part] === colorKey) {
        delete pinned[part]
      } else {
        pinned[part] = colorKey
      }
      return { ...prev, pinned }
    })
  }, [])

  const clearPin = useCallback((part: string) => {
    setState(prev => {
      const pinned = { ...prev.pinned }
      delete pinned[part]
      return { ...prev, pinned }
    })
  }, [])

  const clearAllPins = useCallback(() => {
    update({ pinned: {} })
  }, [])

  // 결과에서 재생성
  const regenerate = useCallback(() => {
    generateAndGoWithState(state, true)
  }, [state])

  // 상세 보기
  const openDetail = useCallback((idx: number) => {
    update({ detailIdx: idx })
    pushStep('detail')
  }, [])

  // 핀 화면으로
  const goToPin = useCallback(() => {
    pushStep('pin')
  }, [])

  // 핀에서 추천받기
  const applyPinsAndGenerate = useCallback(() => {
    generateAndGoWithState(state, true)
  }, [state])

  // fitMode 토글
  const toggleFitMode = useCallback(() => {
    setState(prev => {
      const next = { ...prev, fitMode: !prev.fitMode }
      return next
    })
    // fitMode 변경 후 재생성
    setTimeout(() => generateAndGoWithState({ ...state, fitMode: !state.fitMode }, true), 0)
  }, [state])

  // ─── 추천 생성 핵심 로직 ───
  function generateAndGo() {
    generateAndGoWithState(state)
  }

  function generateAndGoWithState(s: RecState, stayOnResults = false) {
    const results = generateRecommendations(s)
    setState(prev => ({ ...prev, ...s, results }))
    if (!stayOnResults) {
      pushStep('results')
    }
  }

  // 리셋
  const reset = useCallback(() => {
    setState(initialState)
    setStep('mood')
    setHistory([])
  }, [])

  return {
    step, state, history,
    pushStep, goBack, update, reset,
    selectMood, selectStyle, selectLayer,
    setGarment, confirmGarment,
    togglePin, clearPin, clearAllPins,
    regenerate, openDetail, goToPin, applyPinsAndGenerate,
    toggleFitMode,
  }
}

// ─── 추천 생성 함수 (기존 generateRecommendations 포팅) ───
function generateRecommendations(s: RecState): ComboResult[] {
  const { mood, style, layerType, pinned } = s
  let results: ComboResult[] = []

  try {
    // recommend.ts의 함수를 직접 호출하는 대신,
    // 여기서 간이 버전으로 구현 (추후 recommend.ts export 연결)
    // 실제 프로덕션에서는 recommend.ts의 generateOutfitsWithPins, outfitsToComboFormat 사용

    if (style) {
      results = generateSimpleResults(style, 20, layerType, pinned)
    } else if (mood && MOOD_GROUPS[mood]) {
      const styles = MOOD_GROUPS[mood].styles || []
      styles.forEach((st: string) => {
        results.push(...generateSimpleResults(st, 6, layerType, pinned))
      })
      results.sort((a, b) => b.score - a.score)
    } else {
      Object.keys(STYLE_GUIDE).forEach(st => {
        results.push(...generateSimpleResults(st, 3, layerType, pinned))
      })
      results.sort((a, b) => b.score - a.score)
    }

    // 맞춤 적용
    const fitMode = s.fitMode || profile.getFitMode()
    const pc = profile.getPersonalColor()
    const bt = profile.getBodyType()

    if (fitMode && (pc || bt)) {
      results.forEach(r => {
        let bonus = 0
        if (pc) {
          const pcData = (PERSONAL_COLOR_12 as any)[pc]
          if (pcData) {
            FACE_NEAR_ITEMS.forEach(item => {
              if (r.outfit[item]) {
                if ((pcData.bestColors || []).includes(r.outfit[item])) bonus += 5
                if ((pcData.avoidColors || []).includes(r.outfit[item])) bonus -= 10
              }
            })
          }
        }
        if (bt) {
          const btData = (BODY_GUIDE_DATA as any)[bt]
          if (btData?.colorRules) {
            Object.entries(r.outfit).forEach(([part, colorKey]) => {
              if (!colorKey) return
              const rule = btData.colorRules[part]
              if (!rule || rule === 'any') return
              const c = COLORS_60[colorKey as string]
              if (!c) return
              const lightness = c.hcl[2]
              if (rule === 'light' && lightness >= 55) bonus += 3
              else if (rule === 'dark' && lightness <= 45) bonus += 3
              else if (rule === 'light' && lightness < 35) bonus -= 5
              else if (rule === 'dark' && lightness > 70) bonus -= 5
            })
          }
        }
        r.score += bonus
      })
      results.sort((a, b) => b.score - a.score)
    }
  } catch (e) {
    console.error('Recommendation generation error:', e)
  }

  return results.slice(0, 30)
}

// 간이 코디 생성 (recommend.ts 연결 전 임시)
function generateSimpleResults(style: string, count: number, layerType: string, pinned: Record<string, string>): ComboResult[] {
  const moods = (STYLE_MOODS as any)[style]
  if (!moods) return []

  const results: ComboResult[] = []
  const layer = LAYER_LEVELS[layerType] || LAYER_LEVELS['basic']
  const partKeys = layer?.partKeys || ['top', 'bottom', 'shoes']
  const styleName = STYLE_GUIDE[style]?.name || style

  // 각 무드에서 색상 조합 생성
  const moodKeys = Object.keys(moods)

  for (let i = 0; i < count && i < 50; i++) {
    const moodKey = moodKeys[i % moodKeys.length]
    const moodData = moods[moodKey]
    if (!moodData) continue

    const outfit: Record<string, string> = {}
    let score = 60 + Math.floor(Math.random() * 30) // 60~89

    partKeys.forEach((pk: string) => {
      if (pinned[pk]) {
        outfit[pk] = pinned[pk]
      } else {
        // 무드 데이터에서 해당 파트의 색상 풀 가져오기
        const pool = moodData[pk] || moodData.top || Object.keys(COLORS_60).slice(0, 15)
        if (Array.isArray(pool) && pool.length > 0) {
          outfit[pk] = pool[Math.floor(Math.random() * pool.length)]
        }
      }
    })

    // 빈 파트 기본값
    if (!outfit.top) outfit.top = 'white'
    if (!outfit.bottom) outfit.bottom = 'navy'
    if (!outfit.shoes) outfit.shoes = 'brown'

    results.push({
      outfit,
      name: styleName,
      score,
      style,
      tags: [moodKey],
      tip: undefined,
    })
  }

  // 점수순 정렬
  results.sort((a, b) => b.score - a.score)
  return results
}
