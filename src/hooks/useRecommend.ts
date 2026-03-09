// @ts-nocheck
import { useState, useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MOOD_GROUPS, LAYER_LEVELS, STYLE_GUIDE } from '@/lib/styles'
import { getDynamicCombos } from '@/lib/recommend'

export type RecStep = 'mood' | 'style' | 'layer' | 'garment' | 'pin' | 'results' | 'detail'

export interface ComboResult {
  outfit: Record<string, string>
  name: string
  score: number
  tags?: string[]
  tip?: string
  style?: string
  evalResult?: any
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

// 스타일 → 무드그룹 역 매핑
function findMoodForStyle(style: string): string | null {
  for (const [moodKey, group] of Object.entries(MOOD_GROUPS)) {
    if (group.styles.includes(style)) return moodKey
  }
  return null
}

export function useRecommend() {
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState<RecStep>('mood')
  const [state, setState] = useState<RecState>(initialState)
  const [history, setHistory] = useState<RecStep[]>([])
  const initRef = useRef(false)

  // URL에서 style 파라미터 읽어서 해당 스타일로 바로 진입
  useEffect(() => {
    if (initRef.current) return
    const styleParam = searchParams.get('style')
    if (styleParam && STYLE_GUIDE[styleParam]) {
      initRef.current = true
      const mood = findMoodForStyle(styleParam)
      const newState = { ...initialState, mood, style: styleParam }
      // 바로 레이어 선택 단계로
      setState(newState)
      setStep('layer')
      setHistory(['mood', 'style'])
    }
  }, [searchParams])

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

// ─── 추천 생성 함수 (recommend.ts 엔진 연결) ───
function generateRecommendations(s: RecState): ComboResult[] {
  const { mood, style, layerType, pinned } = s
  let results: ComboResult[] = []

  try {
    if (style) {
      // 특정 스타일 지정 → 해당 스타일로 생성
      results = getDynamicCombos(style, layerType, 30, pinned)
    } else if (mood && MOOD_GROUPS[mood]) {
      // 무드만 지정 → 무드 내 모든 스타일에서 생성
      const styles = MOOD_GROUPS[mood].styles || []
      styles.forEach((st: string) => {
        results.push(...getDynamicCombos(st, layerType, 8, pinned))
      })
      results.sort((a, b) => b.score - a.score)
    } else {
      // 전체 → 모든 스타일에서 소량씩
      Object.keys(STYLE_GUIDE).forEach(st => {
        results.push(...getDynamicCombos(st, layerType, 4, pinned))
      })
      results.sort((a, b) => b.score - a.score)
    }
  } catch (e) {
    console.error('Recommendation generation error:', e)
  }

  return results.slice(0, 30)
}
