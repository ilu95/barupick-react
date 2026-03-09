import { useState, useCallback } from 'react'
import { COLORS_60 } from '@/lib/colors'

export interface OotdRecord {
  id: string
  date: string
  colors: Record<string, string | null>
  photos: string[]
  photos_orig?: string[]
  score: number
  weather: string
  weatherData: any
  situation: string | null
  mood: string | null
  memo: string
  visibility: 'private' | 'friends' | 'public'
  showInstagram: boolean
  postId: string | null
  createdAt: number
}

const STORAGE_KEY = 'sp_ootd_records'

export function useOotd() {
  // OOTD 폼 상태
  const [colors, setColors] = useState<Record<string, string | null>>({
    top: null, middleware: null, bottom: null, outer: null, shoes: null, scarf: null, hat: null,
  })
  const [photos, setPhotos] = useState<string[]>([])
  const [situation, setSituation] = useState<string | null>(null)
  const [mood, setMood] = useState<string | null>(null)
  const [memo, setMemo] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'friends' | 'public'>('private')
  const [showInstagram, setShowInstagram] = useState(false)
  const [openPicker, setOpenPicker] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)

  // 레코드 가져오기
  const getRecords = useCallback((): OotdRecord[] => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      return raw.map((r: any) => {
        if (!r.id) r.id = r.date + '_' + ((r.createdAt || Date.now()).toString(36))
        return r
      })
    } catch { return [] }
  }, [])

  // 색상 선택
  const selectColor = useCallback((part: string, colorKey: string) => {
    setColors(prev => ({ ...prev, [part]: colorKey }))
    setOpenPicker(null)
  }, [])

  // 색상 초기화
  const clearColor = useCallback((part: string) => {
    setColors(prev => ({ ...prev, [part]: null }))
  }, [])

  // 사진 추가
  const addPhoto = useCallback((dataUrl: string) => {
    setPhotos(prev => prev.length < 4 ? [...prev, dataUrl] : prev)
  }, [])

  // 사진 삭제
  const removePhoto = useCallback((idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
  }, [])

  // 저장
  const saveRecord = useCallback(() => {
    const outfit: Record<string, string> = {}
    Object.entries(colors).forEach(([k, v]) => { if (v) outfit[k] = v })
    if (Object.keys(outfit).length < 2) return false

    const now = new Date()
    const dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0')

    // 간이 점수 (evaluation 연동은 추후)
    const score = 60 + Object.keys(outfit).length * 5

    const record: OotdRecord = {
      id: editId || (Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
      date: dateStr,
      colors: { ...colors },
      photos: [...photos],
      score,
      weather: '',
      weatherData: null,
      situation,
      mood,
      memo,
      visibility,
      showInstagram,
      postId: null,
      createdAt: Date.now(),
    }

    const records = getRecords()
    if (editId) {
      const idx = records.findIndex(r => r.id === editId)
      if (idx >= 0) records[idx] = record
      else records.unshift(record)
    } else {
      records.unshift(record)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))

    // gamification 연동
    try {
      const gd = JSON.parse(localStorage.getItem('sp_gamification') || '{}')
      if (!gd.records) gd.records = []
      gd.records.push({ date: dateStr, colors: Object.values(outfit), score })
      gd.totalXp = (gd.totalXp || 0) + 20
      localStorage.setItem('sp_gamification', JSON.stringify(gd))
    } catch {}

    return true
  }, [colors, photos, situation, mood, memo, visibility, showInstagram, editId, getRecords])

  // 삭제
  const deleteRecord = useCallback((id: string) => {
    const records = getRecords().filter(r => r.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }, [getRecords])

  // 폼 리셋
  const resetForm = useCallback(() => {
    setColors({ top: null, middleware: null, bottom: null, outer: null, shoes: null, scarf: null, hat: null })
    setPhotos([])
    setSituation(null)
    setMood(null)
    setMemo('')
    setVisibility('private')
    setShowInstagram(false)
    setOpenPicker(null)
    setEditId(null)
  }, [])

  // 편집 모드 시작
  const startEdit = useCallback((record: OotdRecord) => {
    setEditId(record.id)
    setColors(record.colors as any)
    setPhotos(record.photos || [])
    setSituation(record.situation)
    setMood(record.mood)
    setMemo(record.memo || '')
    setVisibility(record.visibility || 'private')
    setShowInstagram(record.showInstagram || false)
  }, [])

  const filledCount = Object.values(colors).filter(Boolean).length
  const canSave = filledCount >= 2
  const needsPhoto = visibility === 'public' && photos.length === 0

  return {
    colors, photos, situation, mood, memo, visibility, showInstagram,
    openPicker, editId, filledCount, canSave, needsPhoto,
    setOpenPicker, selectColor, clearColor,
    addPhoto, removePhoto,
    setSituation, setMood, setMemo, setVisibility, setShowInstagram,
    saveRecord, deleteRecord, resetForm, startEdit, getRecords,
  }
}
