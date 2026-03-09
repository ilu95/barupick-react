// @ts-nocheck
import { useState, useCallback, useRef } from 'react'
import { COLORS_60 } from '@/lib/colors'
import { STYLE_GUIDE, MOOD_GROUPS, LAYER_LEVELS } from '@/lib/styles'
import { STYLE_MOODS } from '@/lib/styleMoods'
import { CATEGORY_NAMES } from '@/lib/categories'
import { profile } from '@/lib/profile'
import { evaluationSystem } from '@/lib/evaluation'

// @ts-nocheck

export type BuildMode = 'coord' | 'evaluate'
export type BuildStep = 'style' | 'item' | 'garment' | 'color' | 'ask' | 'fabric' | 'result' | 'improve'

export interface BuildState {
  mode: BuildMode
  style: string | null
  fabricMode: boolean
  outerType: 'coat' | 'jacket' | 'padding'
  midType: 'knit' | 'cardigan' | 'vest'
  colors: Record<string, string | null>
  fabrics: Record<string, string | null>
  currentItem: string
  startItem: string | null
  itemQueue: (string | { item: string; askFirst: boolean })[]
}

const initialColors = (): Record<string, string | null> => ({
  top: null, bottom: null, outer: null, middleware: null, scarf: null, hat: null, shoes: null,
})

const initialState = (mode: BuildMode = 'coord'): BuildState => ({
  mode,
  style: null,
  fabricMode: false,
  outerType: 'coat',
  midType: 'knit',
  colors: initialColors(),
  fabrics: {},
  currentItem: 'top',
  startItem: null,
  itemQueue: [],
})

export function useBuild(mode: BuildMode = 'coord') {
  const [step, setStep] = useState<BuildStep>('style')
  const [state, setState] = useState<BuildState>(initialState(mode))
  const [history, setHistory] = useState<BuildStep[]>([])
  const [vizCollapsed, setVizCollapsed] = useState(false)

  const pushStep = useCallback((next: BuildStep) => {
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

  const update = useCallback((partial: Partial<BuildState>) => {
    setState(prev => ({ ...prev, ...partial }))
  }, [])

  // ── 스타일 선택 ──
  const selectStyle = useCallback((style: string | null) => {
    update({ style })
    pushStep('item')
  }, [])

  // ── 시작 부위 선택 ──
  const selectStartItem = useCallback((item: string) => {
    const required = ['top', 'bottom'].filter(i => i !== item)
    const allOptional = ['outer', 'middleware', 'scarf', 'hat', 'shoes']
    const optional = allOptional.filter(i => i !== item && !required.includes(i))

    const queue: (string | { item: string; askFirst: boolean })[] = [
      item,
      ...required,
      ...optional.map(i => ({ item: i, askFirst: true })),
    ]

    update({ startItem: item, currentItem: item, itemQueue: queue })

    if (item === 'outer' || item === 'middleware') {
      pushStep('garment')
    } else {
      pushStep('color')
    }
  }, [])

  // ── 옷 종류 설정 ──
  const setGarment = useCallback((type: 'outerType' | 'midType', value: string) => {
    update({ [type]: value } as any)
  }, [])

  const confirmGarment = useCallback(() => {
    pushStep('color')
  }, [])

  // ── 색상 선택 ──
  const selectColor = useCallback((colorKey: string) => {
    setState(prev => {
      const colors = { ...prev.colors, [prev.currentItem]: colorKey }
      return { ...prev, colors }
    })
  }, [])

  // ── 색상 확인 → 다음 아이템 ──
  const confirmColor = useCallback(() => {
    setState(prev => {
      const queue = [...prev.itemQueue]
      queue.shift() // 현재 아이템 제거
      return { ...prev, itemQueue: queue }
    })
    processNext()
  }, [state])

  // ── 다음 아이템 처리 ──
  const processNext = useCallback(() => {
    const queue = [...state.itemQueue]
    queue.shift()

    if (queue.length === 0) {
      // 모든 아이템 처리 완료
      if (state.fabricMode) {
        pushStep('fabric')
      } else {
        pushStep('result')
      }
      return
    }

    const next = queue[0]
    if (typeof next === 'string') {
      update({ currentItem: next, itemQueue: queue })
      if (next === 'outer' || next === 'middleware') {
        pushStep('garment')
      } else {
        pushStep('color')
      }
    } else {
      // 선택적 아이템 → 물어보기
      update({ currentItem: next.item, itemQueue: queue })
      pushStep('ask')
    }
  }, [state])

  // ── 선택적 아이템 응답 ──
  const answerOptional = useCallback((willWear: boolean) => {
    if (willWear) {
      setState(prev => {
        const queue = [...prev.itemQueue]
        queue[0] = prev.currentItem // askFirst 제거
        return { ...prev, itemQueue: queue }
      })
      const item = state.currentItem
      if (item === 'outer' || item === 'middleware') {
        pushStep('garment')
      } else {
        pushStep('color')
      }
    } else {
      // 건너뛰기
      setState(prev => {
        const queue = [...prev.itemQueue]
        queue.shift()
        if (queue.length === 0) {
          if (prev.fabricMode) {
            setTimeout(() => pushStep('fabric'), 0)
          } else {
            setTimeout(() => pushStep('result'), 0)
          }
          return { ...prev, itemQueue: queue }
        }
        const next = queue[0]
        const nextItem = typeof next === 'string' ? next : next.item
        if (typeof next !== 'string') {
          setTimeout(() => pushStep('ask'), 0)
        } else if (nextItem === 'outer' || nextItem === 'middleware') {
          setTimeout(() => pushStep('garment'), 0)
        } else {
          setTimeout(() => pushStep('color'), 0)
        }
        return { ...prev, currentItem: nextItem, itemQueue: queue }
      })
    }
  }, [state])

  // ── 색상 추천 (간이) ──
  const getColorRecommendations = useCallback((part: string): { key: string; score: number }[] => {
    if (state.mode === 'evaluate' || !state.style) return []

    const moods = (STYLE_MOODS as any)[state.style]
    if (!moods) return []

    // 스타일의 첫 번째 무드에서 해당 파트의 색상 풀 가져오기
    const moodKeys = Object.keys(moods)
    const allColors: Record<string, number> = {}

    moodKeys.forEach(mk => {
      const pool = moods[mk]?.[part]
      if (Array.isArray(pool)) {
        pool.forEach((ck: string) => {
          allColors[ck] = (allColors[ck] || 0) + 1
        })
      }
    })

    return Object.entries(allColors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([key, count]) => ({ key, score: Math.min(100, count * 20) }))
  }, [state.style, state.mode])

  // ── 결과에서 색상 개선 ──
  const editPart = useCallback((part: string) => {
    update({ currentItem: part })
    pushStep('color')
  }, [])

  // ── 리셋 ──
  const reset = useCallback(() => {
    setState(initialState(mode))
    setStep('style')
    setHistory([])
  }, [mode])

  // ── 점수 계산 (간이) ──
  const getScore = useCallback(() => {
    const outfit: Record<string, string> = {}
    Object.entries(state.colors).forEach(([k, v]) => { if (v) outfit[k] = v })
    if (Object.keys(outfit).length < 2) return 0
    try {
      const pc = profile.getPersonalColor()
      return evaluationSystem.evaluate(outfit, pc).total
    } catch { return 0 }
  }, [state])

  // 전체 평가 결과 (점수 분해도 포함)
  const getEvalResult = useCallback(() => {
    const outfit: Record<string, string> = {}
    Object.entries(state.colors).forEach(([k, v]) => { if (v) outfit[k] = v })
    if (Object.keys(outfit).length < 2) return null
    try {
      const pc = profile.getPersonalColor()
      return evaluationSystem.evaluate(outfit, pc)
    } catch { return null }
  }, [state])

  // 색상 교체 시 점수 변화 미리보기
  const calcScoreDelta = useCallback((part: string, newColorKey: string) => {
    const outfit: Record<string, string> = {}
    Object.entries(state.colors).forEach(([k, v]) => { if (v) outfit[k] = v })
    if (Object.keys(outfit).length < 2) return 0
    try {
      const pc = profile.getPersonalColor()
      const baseScore = evaluationSystem.evaluate(outfit, pc).total
      const testOutfit = { ...outfit, [part]: newColorKey }
      const newScore = evaluationSystem.evaluate(testOutfit, pc).total
      return newScore - baseScore
    } catch { return 0 }
  }, [state])

  // outfitHex for mannequin
  const outfitHex = Object.entries(state.colors).reduce((acc, [k, v]) => {
    if (v) { const c = COLORS_60[v]; if (c) acc[k] = c.hex }
    return acc
  }, {} as Record<string, string>)

  return {
    step, state, history, vizCollapsed,
    setVizCollapsed,
    pushStep, goBack, update, reset,
    selectStyle, selectStartItem,
    setGarment, confirmGarment,
    selectColor, confirmColor, processNext,
    answerOptional,
    getColorRecommendations, editPart, getScore, getEvalResult, calcScoreDelta,
    outfitHex,
  }
}
