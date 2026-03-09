import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Home, User, Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// 라우트별 헤더 제목 매핑
const TITLES: Record<string, string> = {
  '/home': '바루픽',
  '/closet': '옷장',
  '/record': 'OOTD 기록',
  '/community': '커뮤니티',
  '/shop': '샵',
  '/profile': '마이',
  '/profile/settings': '설정',
  '/profile/level': '내 레벨',
  '/profile/badges': '배지 컬렉션',
  '/profile/personal-color': '퍼스널컬러',
  '/auth/login': '로그인',
  '/auth/signup': '회원가입',
  '/home/build': '코디 만들기',
  '/home/recommend': '코디 추천받기',
  '/home/weather': '오늘 뭐 입지?',
  '/home/saved': '저장한 코디',
  '/home/quiz': '스타일 퀴즈',
  '/home/fabric': '소재 가이드',
  '/home/body': '체형별 코디 가이드',
}

// 헤더 숨김 화면
const HIDDEN_ROUTES = ['/onboarding', '/pc-light']

export default function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()

  if (HIDDEN_ROUTES.some(r => location.pathname.startsWith(r))) return null

  const isHome = location.pathname === '/home' || location.pathname === '/'
  const title = TITLES[location.pathname] || '바루픽'
  const canGoBack = !isHome && window.history.length > 1

  return (
    <header
      className="sticky top-0 z-[100] bg-warm-200/88 dark:bg-[#1C1917]/90 backdrop-blur-[20px] flex items-center gap-3"
      style={{
        padding: '12px 20px',
        paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))',
      }}
    >
      {/* 뒤로가기 */}
      {canGoBack && (
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow-warm-sm active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
      )}

      {/* 제목 */}
      <span className="flex-1 font-display text-[17px] font-bold text-warm-900 tracking-tight truncate">
        {title}
      </span>

      {/* 알림 */}
      <button
        onClick={() => navigate('/notifications')}
        className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow-warm-sm active:scale-90 transition-transform relative"
      >
        <Bell size={17} strokeWidth={2} />
      </button>

      {/* 프로필 */}
      <button
        onClick={() => navigate('/profile')}
        className="w-9 h-9 rounded-full bg-terra-100 flex items-center justify-center shadow-warm-sm active:scale-90 transition-transform overflow-hidden flex-shrink-0"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} className="w-9 h-9 rounded-full object-cover" alt="" />
        ) : (
          <User size={18} strokeWidth={2} className="text-terra-600" />
        )}
      </button>
    </header>
  )
}
