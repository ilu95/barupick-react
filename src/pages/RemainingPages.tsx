// @ts-nocheck
// ================================================================
// RemainingPages.tsx — 나머지 페이지 모음
// ================================================================
import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CloudSun, Thermometer, Droplets, Wind, HelpCircle, Scissors, Ruler, ShoppingBag, ExternalLink, Trophy, ChevronRight, Palette, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import MannequinSVG from '@/components/mannequin/MannequinSVG'
import { COLORS_60 } from '@/lib/colors'
import { STYLE_GUIDE, MOOD_GROUPS, LAYER_LEVELS } from '@/lib/styles'
import { PERSONAL_COLOR_12 } from '@/lib/personalColor'
import { BODY_GUIDE_DATA, BODY_TYPE_DIAGNOSIS } from '@/lib/bodyType'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { profile } from '@/lib/profile'

// ─── 날씨 코디 ───
export function Weather() {
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`)
        const data = await res.json()
        const c = data.current
        setWeather({ temp: Math.round(c.temperature_2m), feels: Math.round(c.apparent_temperature), humidity: c.relative_humidity_2m, wind: Math.round(c.wind_speed_10m), code: c.weather_code })
      } catch { setWeather(null) } finally { setLoading(false) }
    }, () => { setLoading(false) })
  }, [])

  const getLayerAdvice = (feels: number) => {
    if (feels >= 28) return { layer: 'simple', desc: '반팔 + 반바지', emoji: '☀️' }
    if (feels >= 23) return { layer: 'simple', desc: '반팔 + 긴바지', emoji: '🌤️' }
    if (feels >= 17) return { layer: 'basic', desc: '긴팔 + 긴바지', emoji: '⛅' }
    if (feels >= 12) return { layer: 'basic', desc: '자켓 or 가디건', emoji: '🍂' }
    if (feels >= 5) return { layer: 'mid_inner', desc: '코트 + 니트', emoji: '🧥' }
    return { layer: 'layered', desc: '패딩 + 기모', emoji: '❄️' }
  }

  if (loading) return <div className="animate-screen-fade px-5 pt-6 text-center py-20 text-sm text-warm-400">날씨를 불러오는 중...</div>

  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-5">오늘 뭐 입지?</h2>
      {weather ? (
        <>
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-5 mb-5 text-center">
            <div className="text-4xl mb-2">{getLayerAdvice(weather.feels).emoji}</div>
            <div className="font-display text-3xl font-bold text-warm-900">{weather.temp}°C</div>
            <div className="text-sm text-warm-600 mt-1">체감 {weather.feels}°C</div>
            <div className="flex justify-center gap-4 mt-3 text-xs text-warm-600">
              <span className="flex items-center gap-1"><Droplets size={12} /> {weather.humidity}%</span>
              <span className="flex items-center gap-1"><Wind size={12} /> {weather.wind}km/h</span>
            </div>
          </div>
          <div className="bg-white border border-warm-400 rounded-2xl p-4 shadow-warm-sm mb-5">
            <div className="text-sm font-bold text-warm-900 mb-1">추천 레이어</div>
            <div className="text-sm text-warm-600">{getLayerAdvice(weather.feels).desc}</div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-warm-600 text-sm">위치 정보를 허용하면 날씨 기반 추천을 받을 수 있어요</div>
      )}
    </div>
  )
}

// ─── 스타일 퀴즈 ───
export function Quiz() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const questions = [
    { q: '주말에 주로 뭘 하시나요?', a: ['카페 탐방 ☕', '운동/하이킹 🏃', '쇼핑/전시 🛍️', '집에서 휴식 🏠'] },
    { q: '선호하는 컬러 톤은?', a: ['뉴트럴/베이지 계열', '네이비/차콜 계열', '파스텔/밝은 톤', '다크/무채색'] },
    { q: '옷 고를 때 가장 중요한 건?', a: ['편안함', '세련됨', '개성', '가성비'] },
    { q: '자주 신는 신발은?', a: ['스니커즈 👟', '로퍼/구두 👞', '부츠 🥾', '슬리퍼/샌들 🩴'] },
  ]
  const done = step >= questions.length

  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      {!done ? (
        <>
          <div className="h-1 bg-warm-300 rounded-full mb-5"><div className="h-full bg-terra-500 rounded-full transition-all" style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
          <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-2">{questions[step].q}</h2>
          <p className="text-sm text-warm-600 mb-5">{step + 1} / {questions.length}</p>
          <div className="flex flex-col gap-2.5">
            {questions[step].a.map(a => (
              <button key={a} onClick={() => { setAnswers([...answers, a]); setStep(step + 1) }}
                className="w-full py-3.5 bg-white border border-warm-400 rounded-2xl text-sm font-medium text-warm-800 shadow-warm-sm active:scale-[0.98] transition-all hover:border-terra-300 text-left px-4">{a}</button>
            ))}
          </div>
          {step > 0 && <button onClick={() => { setStep(step - 1); setAnswers(answers.slice(0, -1)) }} className="w-full text-center text-sm text-warm-500 mt-4 active:opacity-70">이전 질문</button>}
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="font-display text-xl font-bold text-warm-900 mb-2">분석 완료!</h2>
          <p className="text-sm text-warm-600 mb-5">당신에게 어울리는 스타일을 찾았어요</p>
          <div className="bg-terra-100 border border-terra-200 rounded-2xl p-5 mb-5">
            <div className="text-2xl mb-2">👔</div>
            <div className="font-display text-lg font-bold text-terra-700">캐주얼 룩</div>
            <div className="text-sm text-warm-600 mt-1">편안하면서도 센스 있는 일상 코디</div>
          </div>
          <button onClick={() => navigate('/home/recommend?style=casual')} className="px-6 py-3 bg-terra-500 text-white rounded-2xl font-semibold text-sm active:scale-[0.98] transition-all shadow-terra">이 스타일로 추천받기</button>
        </div>
      )}
    </div>
  )
}

// ─── 소재 가이드 ───
export function FabricGuide() {
  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-2">소재 가이드</h2>
      <p className="text-sm text-warm-600 mb-5">소재별 특성과 궁합을 확인하세요</p>
      {['면/코튼', '울/모직', '데님', '니트', '실크', '린넨', '폴리에스터', '가죽'].map(fabric => (
        <div key={fabric} className="bg-white border border-warm-400 rounded-2xl p-4 mb-2.5 shadow-warm-sm">
          <div className="flex items-center gap-3"><Scissors size={18} className="text-terra-500" /><div className="text-sm font-semibold text-warm-900">{fabric}</div></div>
        </div>
      ))}
    </div>
  )
}

// ─── 체형별 코디 ───
export function BodyGuide() {
  const navigate = useNavigate()
  const bodyTypes = Object.entries(BODY_GUIDE_DATA || {}).slice(0, 6)

  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-2">체형별 코디 가이드</h2>
      <p className="text-sm text-warm-600 mb-5">내 체형에 맞는 컬러 배치를 확인하세요</p>
      <div className="flex flex-col gap-2.5">
        {bodyTypes.map(([key, data]: [string, any]) => (
          <div key={key} className="bg-white border border-warm-400 rounded-2xl p-4 shadow-warm-sm">
            <div className="flex items-center gap-3">
              <Ruler size={20} className="text-terra-500" />
              <div className="flex-1"><div className="text-sm font-semibold text-warm-900">{data.name || key}</div>{data.description && <div className="text-[11px] text-warm-500 mt-0.5">{data.description}</div>}</div>
              <ChevronRight size={16} className="text-warm-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 샵 ───
export function Shop() {
  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-2">샵</h2>
      <p className="text-sm text-warm-600 mb-5">바루사 빈티지 셀렉트샵</p>
      <div className="bg-gradient-to-br from-terra-50 to-warm-100 border border-terra-200 rounded-2xl p-6 text-center mb-5">
        <div className="text-3xl mb-3">👕</div>
        <div className="font-display text-lg font-bold text-terra-700 mb-1">BARUSA</div>
        <div className="text-sm text-warm-600 mb-4">프리미엄 빈티지 의류 셀렉트샵</div>
        <div className="flex flex-col gap-2.5">
          <a href="https://barusa.co.kr" target="_blank" rel="noopener" className="flex items-center justify-center gap-2 py-3 bg-terra-500 text-white rounded-2xl font-semibold text-sm active:scale-[0.98] transition-all shadow-terra">
            <ShoppingBag size={16} /> 바루사 홈페이지 <ExternalLink size={14} />
          </a>
          <a href="https://instagram.com/barusa.magazine" target="_blank" rel="noopener" className="flex items-center justify-center gap-2 py-3 bg-white border border-warm-400 text-warm-800 rounded-2xl font-medium text-sm active:scale-[0.98] transition-all">
            📸 @barusa.magazine <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── 이용약관 ───
export function Terms() {
  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-5">이용약관</h2>
      <div className="bg-white border border-warm-400 rounded-2xl p-5 shadow-warm-sm text-sm text-warm-700 leading-relaxed space-y-3">
        <p><strong>제1조 (목적)</strong> 이 약관은 바루픽(이하 "서비스")의 이용 조건 및 절차를 규정합니다.</p>
        <p><strong>제2조 (서비스 내용)</strong> 서비스는 AI 기반 컬러 코디네이션 추천, OOTD 기록, 커뮤니티 기능을 제공합니다.</p>
        <p><strong>제3조 (이용자 의무)</strong> 이용자는 타인의 권리를 침해하거나 부적절한 콘텐츠를 게시해서는 안 됩니다.</p>
        <p><strong>제4조 (면책조항)</strong> 서비스에서 제공하는 코디 추천은 참고용이며, 서비스는 추천 결과에 대한 책임을 지지 않습니다.</p>
      </div>
    </div>
  )
}

// ─── 개인정보처리방침 ───
export function Privacy() {
  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-5">개인정보처리방침</h2>
      <div className="bg-white border border-warm-400 rounded-2xl p-5 shadow-warm-sm text-sm text-warm-700 leading-relaxed space-y-3">
        <p><strong>1. 수집하는 개인정보</strong> 이메일, 닉네임, 프로필 사진(선택), 코디 기록</p>
        <p><strong>2. 수집 목적</strong> 서비스 제공, 커뮤니티 기능, 맞춤 추천</p>
        <p><strong>3. 보유 기간</strong> 회원 탈퇴 시 즉시 삭제</p>
        <p><strong>4. 제3자 제공</strong> 제3자에게 개인정보를 제공하지 않습니다.</p>
        <p><strong>5. 문의</strong> barusa.official@gmail.com</p>
      </div>
    </div>
  )
}

// ─── 이벤트 상세 ───
export function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) return
    Promise.all([
      supabase.from('events').select('*').eq('id', eventId).single(),
      supabase.from('event_submissions').select('*').eq('event_id', eventId).order('created_at', { ascending: true }),
    ]).then(([evRes, subRes]) => {
      setEvent(evRes.data)
      setSubmissions(subRes.data || [])
      setLoading(false)
    })
  }, [eventId])

  if (loading) return <div className="animate-screen-fade px-5 pt-6 text-center py-20 text-sm text-warm-400">불러오는 중...</div>
  if (!event) return <div className="animate-screen-fade px-5 pt-6 text-center py-20 text-sm text-warm-600">이벤트를 찾을 수 없어요</div>

  const now = new Date(), start = new Date(event.start_date), end = new Date(event.end_date)
  const isActive = now >= start && now <= end

  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      <div className="bg-gradient-to-br from-terra-500 to-amber-500 rounded-2xl p-5 text-white mb-5">
        <div className="text-[10px] uppercase tracking-wider opacity-80 mb-1">{isActive ? '🔥 진행중' : '⏳ 종료'}</div>
        <h2 className="font-display text-xl font-bold tracking-tight mb-1">{event.title}</h2>
        {event.description && <div className="text-sm opacity-90 mb-2">{event.description}</div>}
        {event.reward && <div className="text-sm font-semibold">🎁 {event.reward}</div>}
      </div>

      <div className="text-xs font-semibold text-warm-600 uppercase tracking-wider mb-3">참가작 ({submissions.length})</div>
      {submissions.length > 0 ? (
        <div className="grid grid-cols-2 gap-2.5">
          {submissions.map((sub, idx) => {
            const outfitHex: Record<string, string> = {}
            Object.entries(sub.outfit || {}).forEach(([k, v]) => { if (v) outfitHex[k] = COLORS_60[v as string]?.hex || (v as string) })
            return (
              <div key={sub.id} className="bg-white border border-warm-400 rounded-2xl p-3 shadow-warm-sm text-center">
                {idx < 3 && <div className="text-lg mb-1">{['🥇', '🥈', '🥉'][idx]}</div>}
                {sub.photo_urls?.[0] ? <img src={sub.photo_urls[0]} className="w-full aspect-square rounded-xl object-cover mb-2" alt="" />
                : <div className="flex justify-center mb-2"><MannequinSVG outfit={outfitHex} size={80} /></div>}
                <div className="text-xs font-semibold text-terra-600">{sub.score}점</div>
              </div>
            )
          })}
        </div>
      ) : <div className="text-center py-10 text-warm-400 text-sm">아직 참가작이 없어요</div>}

      {isActive && (
        <button onClick={() => navigate(`/community/event/${eventId}/submit`)}
          className="w-full py-3.5 bg-terra-500 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-terra mt-5">
          🎨 참여하기
        </button>
      )}
    </div>
  )
}

// ─── 퍼스널컬러 선택 ───
export function PcSelect() {
  const navigate = useNavigate()
  const current = profile.getPersonalColor()
  const currentData = current ? (PERSONAL_COLOR_12 as any)[current] : null

  const setPC = (key: string) => {
    profile.setPersonalColor(key)
    alert((PERSONAL_COLOR_12 as any)[key]?.name + '으로 설정했어요!')
    navigate('/profile', { replace: true })
  }

  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-2">퍼스널컬러</h2>
      {currentData ? (
        <div className="bg-terra-100 border border-terra-200 rounded-2xl p-4 mb-5">
          <div className="text-sm font-semibold text-terra-700 mb-0.5">현재 설정: {currentData.name}</div>
          <div className="text-[11px] text-warm-600">{currentData.description || ''}</div>
          <button onClick={() => { profile.setPersonalColor(''); navigate('/profile/personal-color', { replace: true }) }}
            className="text-xs text-terra-600 mt-2 active:opacity-70">다시 진단하기</button>
        </div>
      ) : (
        <p className="text-sm text-warm-600 mb-5">퍼스널컬러를 설정하면 맞춤 추천을 받을 수 있어요</p>
      )}

      <div className="text-xs font-semibold text-warm-600 uppercase tracking-wider mb-3">12계절 직접 선택</div>
      <div className="grid grid-cols-2 gap-2.5">
        {Object.entries(PERSONAL_COLOR_12).filter(([k]) => !['spring', 'summer', 'autumn', 'winter'].includes(k)).map(([key, data]: [string, any]) => (
          <button key={key} onClick={() => setPC(key)}
            className={`bg-white border rounded-2xl p-4 text-left shadow-warm-sm active:scale-[0.97] transition-all ${current === key ? 'border-terra-400 bg-terra-50' : 'border-warm-400'}`}>
            <div className="text-sm font-semibold text-warm-900">{data.name}</div>
            <div className="text-[10px] text-warm-500 mt-0.5 line-clamp-2">{data.description || ''}</div>
            {data.bestColors && (
              <div className="flex gap-1 mt-2">
                {data.bestColors.slice(0, 5).map((ck: string) => {
                  const c = COLORS_60[ck]; return c ? <div key={ck} className="w-4 h-4 rounded-full border border-warm-400/50" style={{ background: c.hex }} /> : null
                })}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
