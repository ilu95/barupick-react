import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wand2, Palette, CloudSun, Bookmark, Scissors, Ruler, HelpCircle, ChevronRight, Flame, Calendar, Sparkles, Download, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { usePWA } from '@/hooks/usePWA'

export default function Home() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { canInstall, install } = usePWA()

  // 온보딩 체크
  useEffect(() => {
    if (!localStorage.getItem('sp_onboarded')) {
      navigate('/onboarding', { replace: true })
    }
  }, [])

  // 시간대별 인사
  const hour = new Date().getHours()
  const greeting = hour < 12 ? '좋은 아침' : hour < 18 ? '좋은 오후' : '좋은 저녁'
  const userName = profile?.nickname || ''
  const greetingText = userName ? `${greeting}, ${userName}님` : greeting

  return (
    <div className="animate-screen-fade px-5 pt-[18px] pb-10">
      {/* 인사 + 칩 */}
      <div className="pb-5">
        <h1 className="font-display text-[clamp(22px,5.5vw,28px)] font-bold tracking-tight text-warm-900 leading-tight mb-3">
          {greetingText}
        </h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => navigate('/home/weather')} className="inline-flex items-center gap-1.5 bg-white border border-warm-400 rounded-full px-3.5 py-2 text-sm text-warm-600 shadow-warm-sm active:scale-[0.97] transition-all">
            <CloudSun size={16} /> 날씨 불러오는 중...
          </button>
          <button onClick={() => navigate('/record')} className="inline-flex items-center gap-1.5 bg-white border border-warm-400 rounded-full px-3.5 py-2 text-sm text-warm-600 shadow-warm-sm active:scale-[0.97] transition-all">
            <Calendar size={16} /> 오늘 첫 기록을 남겨보세요
          </button>
        </div>
      </div>

      {/* 퍼스널컬러 미설정 배너 */}
      <button onClick={() => navigate('/profile/personal-color')} className="w-full flex items-center gap-3 bg-terra-100 border border-terra-200 rounded-2xl px-4 py-3.5 mb-5 text-left active:scale-[0.98] transition-all">
        <div className="w-10 h-10 rounded-xl bg-terra-200 flex items-center justify-center flex-shrink-0">
          <Sparkles size={20} className="text-terra-600" />
        </div>
        <span className="text-sm text-terra-700 leading-snug flex-1">퍼스널컬러를 설정하면 더 정확한 추천을 받을 수 있어요</span>
        <ChevronRight size={16} className="text-terra-600 flex-shrink-0" />
      </button>

      <div className="h-px bg-warm-400 mb-5" />

      {/* 메인 CTA */}
      <div className="flex flex-col gap-3 mb-6">
        {/* 히어로 — 코디 추천받기 */}
        <button onClick={() => navigate('/home/recommend')} className="group w-full bg-gradient-to-br from-terra-50 to-terra-100 border-[1.5px] border-terra-300 rounded-2xl p-5 flex items-center gap-4 text-left active:scale-[0.98] transition-all shadow-warm-sm hover:shadow-warm">
          <div className="w-14 h-14 rounded-2xl bg-terra-200 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Wand2 size={26} className="text-terra-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-lg font-bold text-terra-700 tracking-tight">코디 추천받기</div>
            <div className="text-sm text-warm-600 mt-0.5">AI가 분석하는 오늘의 컬러 조합</div>
          </div>
          <ChevronRight size={18} className="text-terra-600 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* 직접 만들기 */}
        <button onClick={() => navigate('/home/build')} className="group w-full bg-white border border-warm-400 rounded-2xl p-4 flex items-center gap-3.5 text-left active:scale-[0.98] transition-all shadow-warm-sm hover:shadow-warm">
          <div className="w-11 h-11 rounded-xl bg-warm-300 flex items-center justify-center flex-shrink-0">
            <Palette size={20} className="text-warm-800" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold text-warm-900 tracking-tight">직접 만들기</div>
            <div className="text-xs text-warm-600 mt-0.5">내 조합의 점수를 확인해보세요</div>
          </div>
          <ChevronRight size={16} className="text-warm-500 flex-shrink-0 opacity-50" />
        </button>

        {/* 하단 2열 */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/home/weather')} className="group bg-white border border-warm-400 rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.97] transition-all shadow-warm-sm hover:shadow-warm">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
              <CloudSun size={18} className="text-sky-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-warm-900">날씨 코디</div>
              <div className="text-[11px] text-warm-500 mt-0.5">오늘 기온에 맞는</div>
            </div>
          </button>

          <button onClick={() => navigate('/home/saved')} className="group bg-white border border-warm-400 rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.97] transition-all shadow-warm-sm hover:shadow-warm">
            <div className="w-10 h-10 rounded-xl bg-warm-300 flex items-center justify-center flex-shrink-0">
              <Bookmark size={18} className="text-warm-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-warm-900">저장한 코디</div>
              <div className="text-[11px] text-warm-500 mt-0.5">즐겨찾기</div>
            </div>
          </button>
        </div>
      </div>

      {/* 가이드 섹션 */}
      <div className="mb-5">
        <div className="text-xs font-semibold text-warm-600 tracking-widest uppercase mb-3 flex items-center gap-1.5">
          가이드
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <button onClick={() => navigate('/home/fabric')} className="bg-white border border-warm-400 rounded-2xl py-5 px-2 text-center shadow-warm-sm active:scale-[0.97] transition-all hover:shadow-warm">
            <Scissors size={24} className="text-terra-600 mx-auto mb-2" />
            <div className="text-[13px] font-medium text-warm-800">소재 가이드</div>
          </button>
          <button onClick={() => navigate('/home/body')} className="bg-white border border-warm-400 rounded-2xl py-5 px-2 text-center shadow-warm-sm active:scale-[0.97] transition-all hover:shadow-warm">
            <Ruler size={24} className="text-terra-600 mx-auto mb-2" />
            <div className="text-[13px] font-medium text-warm-800">체형별 코디</div>
          </button>
          <button onClick={() => navigate('/home/quiz')} className="bg-white border border-warm-400 rounded-2xl py-5 px-2 text-center shadow-warm-sm active:scale-[0.97] transition-all hover:shadow-warm">
            <HelpCircle size={24} className="text-terra-600 mx-auto mb-2" />
            <div className="text-[13px] font-medium text-warm-800">퀴즈</div>
          </button>
        </div>
      </div>

      {/* PWA 설치 배너 */}
      {canInstall && (
        <div className="bg-white border border-terra-200 rounded-2xl p-4 flex items-center gap-3 shadow-warm-sm animate-slide-up">
          <div className="w-10 h-10 rounded-xl bg-terra-100 flex items-center justify-center flex-shrink-0">
            <Download size={20} className="text-terra-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-warm-900">홈 화면에 추가</div>
            <div className="text-[11px] text-warm-600">앱처럼 빠르게 실행할 수 있어요</div>
          </div>
          <button
            onClick={install}
            className="px-3.5 py-1.5 bg-terra-500 text-white rounded-full text-[11px] font-semibold active:scale-95 transition-all shadow-terra flex-shrink-0"
          >
            설치
          </button>
        </div>
      )}
    </div>
  )
}
