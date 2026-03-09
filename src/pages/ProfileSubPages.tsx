// @ts-nocheck
// ================================================================
// ProfileSubPages.tsx — 프로필 하위 페이지 모음
// MyLevel, MyBadges, ColorRanking, ColorPattern, Challenges, TitleExam, MyPosts, Insights
// ================================================================
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Award, Palette, Target, GraduationCap, ScanLine, Star, ChevronRight, FileText, TrendingUp, Eye, Heart, Bookmark } from 'lucide-react'
import MannequinSVG from '@/components/mannequin/MannequinSVG'
import { COLORS_60 } from '@/lib/colors'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { gamification } from '@/lib/gamification'

// @ts-nocheck

// ─── 내 레벨 ───
export function MyLevel() {
  // @ts-ignore
  const lv = gamification.getLevel ? gamification.getLevel() : { level: 1, name: '입문자', progress: 0, currentXp: 0, nextXp: 100 }
  const circumference = 2 * Math.PI * 52
  const offset = circumference * (1 - lv.progress / 100)

  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      <div className="text-center mb-6">
        <div className="relative w-[140px] h-[140px] mx-auto mb-4">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx={60} cy={60} r={52} fill="none" stroke="#E7E5E4" strokeWidth={10} />
            <circle cx={60} cy={60} r={52} fill="none" stroke="#C2785C" strokeWidth={10} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-bold text-warm-900">{lv.level}</span>
            <span className="text-xs text-warm-600">{lv.name}</span>
          </div>
        </div>
        <div className="text-sm text-warm-600">경험치 {lv.currentXp || 0} / {lv.nextXp || 100}</div>
        <div className="h-2 bg-warm-300 rounded-full mt-2 max-w-[200px] mx-auto"><div className="h-full bg-terra-500 rounded-full transition-all" style={{ width: `${lv.progress}%` }} /></div>
      </div>
      <div className="bg-white border border-warm-400 rounded-2xl p-4 shadow-warm-sm">
        <div className="text-xs font-semibold text-warm-600 uppercase tracking-wider mb-3">경험치 획득 방법</div>
        {[['OOTD 기록', '+20 XP'], ['코디 만들기', '+15 XP'], ['커뮤니티 공유', '+25 XP'], ['좋아요 받기', '+5 XP'], ['배지 획득', '+50 XP']].map(([label, xp]) => (
          <div key={label} className="flex items-center justify-between py-2.5 border-b border-warm-300 last:border-0">
            <span className="text-sm text-warm-800">{label}</span>
            <span className="text-xs font-semibold text-terra-600">{xp}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 배지 컬렉션 ───
export function MyBadges() {
  // @ts-ignore
  const badges = gamification.getBadges ? gamification.getBadges() : []

  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-1">배지 컬렉션</h2>
      <p className="text-sm text-warm-600 mb-5">{badges.filter((b: any) => b.earned).length}/{badges.length}개 획득</p>
      <div className="grid grid-cols-3 gap-2.5">
        {badges.map((badge: any) => (
          <div key={badge.id} className={`bg-white border rounded-2xl p-4 text-center shadow-warm-sm ${badge.earned ? 'border-terra-300' : 'border-warm-400 opacity-50'}`}>
            <div className="text-3xl mb-2">{badge.icon || '🏅'}</div>
            <div className="text-[12px] font-semibold text-warm-900">{badge.name}</div>
            <div className="text-[10px] text-warm-500 mt-0.5">{badge.description}</div>
            {badge.earned && <div className="text-[9px] text-terra-600 font-medium mt-1">획득 ✓</div>}
          </div>
        ))}
      </div>
      {badges.length === 0 && <div className="text-center py-16"><Award size={40} className="text-warm-400 mx-auto mb-3" /><div className="text-sm text-warm-600">OOTD를 기록하면 배지를 획득할 수 있어요</div></div>}
    </div>
  )
}

// ─── 컬러 랭킹 ───
export function ColorRanking() {
  const records = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('sp_ootd_records') || '[]') } catch { return [] }
  }, [])

  const colorCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    records.forEach((r: any) => {
      Object.values(r.colors || {}).forEach(ck => { if (ck) counts[ck as string] = (counts[ck as string] || 0) + 1 })
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 20)
  }, [records])

  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-1">컬러 랭킹</h2>
      <p className="text-sm text-warm-600 mb-5">내가 가장 많이 입은 색상</p>
      {colorCounts.length > 0 ? (
        <div className="flex flex-col gap-2">
          {colorCounts.map(([ck, count], idx) => {
            const c = COLORS_60[ck]
            if (!c) return null
            const maxCount = colorCounts[0][1]
            return (
              <div key={ck} className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-bold text-warm-600">{idx + 1}</span>
                <span className="w-8 h-8 rounded-lg border border-warm-400 flex-shrink-0" style={{ background: c.hex }} />
                <div className="flex-1"><div className="text-sm font-medium text-warm-900">{c.name}</div>
                  <div className="h-1.5 bg-warm-300 rounded-full mt-1"><div className="h-full bg-terra-500 rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} /></div>
                </div>
                <span className="text-xs font-semibold text-warm-600">{count}회</span>
              </div>
            )
          })}
        </div>
      ) : <div className="text-center py-16"><Palette size={40} className="text-warm-400 mx-auto mb-3" /><div className="text-sm text-warm-600">OOTD를 기록하면 컬러 랭킹을 볼 수 있어요</div></div>}
    </div>
  )
}

// ─── 색상 패턴 분석 ───
export function ColorPattern() {
  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-1">색상 패턴 분석</h2>
      <p className="text-sm text-warm-600 mb-5">내 컬러 DNA를 분석합니다</p>
      <div className="text-center py-12"><ScanLine size={48} className="text-terra-500 mx-auto mb-4" /><div className="text-sm text-warm-600">10개 이상 기록하면 분석을 시작할 수 있어요</div></div>
    </div>
  )
}

// ─── 주간 챌린지 ───
export function Challenges() {
  // @ts-ignore
  const challenges = gamification.getWeeklyChallenges ? gamification.getWeeklyChallenges() : []

  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-1">주간 챌린지</h2>
      <p className="text-sm text-warm-600 mb-5">{challenges.filter((c: any) => c.completed).length}/{challenges.length}개 완료</p>
      {challenges.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {challenges.map((ch: any, idx: number) => (
            <div key={idx} className={`bg-white border rounded-2xl p-4 shadow-warm-sm ${ch.completed ? 'border-sage' : 'border-warm-400'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ch.completed ? 'bg-sage/20' : 'bg-warm-200'}`}>
                  <Target size={20} className={ch.completed ? 'text-sage' : 'text-warm-600'} />
                </div>
                <div className="flex-1"><div className="text-sm font-semibold text-warm-900">{ch.title || '챌린지'}</div><div className="text-[11px] text-warm-500 mt-0.5">{ch.description || ''}</div></div>
                {ch.completed ? <span className="text-xs font-bold text-sage">완료 ✓</span> : <span className="text-xs text-warm-500">{ch.progress || 0}/{ch.goal || 1}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : <div className="text-center py-16"><Target size={40} className="text-warm-400 mx-auto mb-3" /><div className="text-sm text-warm-600">이번 주 챌린지가 곧 시작돼요</div></div>}
    </div>
  )
}

// ─── 칭호 시험 ───
export function TitleExam() {
  const navigate = useNavigate()
  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-1">칭호 시험</h2>
      <p className="text-sm text-warm-600 mb-5">컬러 지식을 테스트하고 칭호를 획득하세요</p>
      <div className="flex flex-col gap-2.5">
        {['컬러 초보', '컬러 중급자', '컬러 전문가', '컬러 마스터'].map((title, idx) => (
          <button key={title} className="bg-white border border-warm-400 rounded-2xl p-4 shadow-warm-sm text-left active:scale-[0.98] transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-terra-100 flex items-center justify-center"><GraduationCap size={20} className="text-terra-600" /></div>
              <div className="flex-1"><div className="text-sm font-semibold text-warm-900">{title}</div><div className="text-[11px] text-warm-500 mt-0.5">{(idx + 1) * 5}문제 · {['기초', '중급', '고급', '마스터'][idx]}</div></div>
              <ChevronRight size={16} className="text-warm-500" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── 내 게시물 ───
export function MyPosts() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase.from('posts').select('id, created_at, likes_count, view_count, save_count, comments_count, outfit, style, caption, photo_urls, score')
      .eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoading(false) })
  }, [user])

  if (loading) return <div className="animate-screen-fade px-5 pt-6 text-center py-20 text-sm text-warm-400">불러오는 중...</div>

  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-5">내 게시물 ({posts.length})</h2>
      {posts.length > 0 ? (
        <div className="grid grid-cols-3 gap-1.5">
          {posts.map(p => {
            const hasPhoto = p.photo_urls && p.photo_urls.length > 0
            const outfitHex: Record<string, string> = {}
            Object.entries(p.outfit || {}).forEach(([k, v]) => { if (v) outfitHex[k] = COLORS_60[v as string]?.hex || (v as string) })
            return (
              <button key={p.id} onClick={() => navigate(`/community/${p.id}`)} className="aspect-square rounded-xl overflow-hidden bg-warm-100 active:scale-95 transition-transform relative">
                {hasPhoto ? <img src={p.photo_urls[0]} className="w-full h-full object-cover" alt="" />
                : <div className="w-full h-full flex items-center justify-center"><MannequinSVG outfit={outfitHex} size={50} /></div>}
                <div className="absolute bottom-0.5 right-0.5 text-[9px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded-full">♡{p.likes_count||0}</div>
              </button>
            )
          })}
        </div>
      ) : <div className="text-center py-16"><FileText size={40} className="text-warm-400 mx-auto mb-3" /><div className="text-sm text-warm-600">아직 게시물이 없어요</div></div>}
    </div>
  )
}

// ─── 인사이트 ───
export function Insights() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ views: 0, likes: 0, saves: 0 })

  useEffect(() => {
    if (!user) return
    supabase.from('posts').select('likes_count, view_count, save_count').eq('user_id', user.id)
      .then(({ data }) => {
        if (data) {
          setStats({
            views: data.reduce((s, p) => s + (p.view_count || 0), 0),
            likes: data.reduce((s, p) => s + (p.likes_count || 0), 0),
            saves: data.reduce((s, p) => s + (p.save_count || 0), 0),
          })
        }
      })
  }, [user])

  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-5">인사이트</h2>
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {[['조회', stats.views, <Eye size={20} />], ['좋아요', stats.likes, <Heart size={20} />], ['저장', stats.saves, <Bookmark size={20} />]].map(([label, val, icon]) => (
          <div key={label as string} className="bg-white border border-warm-400 rounded-2xl py-4 text-center shadow-warm-sm">
            <div className="text-terra-500 flex justify-center mb-1">{icon as any}</div>
            <div className="font-display text-xl font-bold text-warm-900">{val as number}</div>
            <div className="text-[10px] text-warm-600 mt-0.5">{label as string}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 저장한 코디 ───
export function SavedCoords() {
  const navigate = useNavigate()
  const saved = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('cs_saved') || '[]') } catch { return [] }
  }, [])

  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-5">저장한 코디 ({saved.length})</h2>
      {saved.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {saved.map((item: any, idx: number) => {
            const outfitHex: Record<string, string> = {}
            Object.entries(item.outfit || item.colors || {}).forEach(([k, v]) => {
              if (v) outfitHex[k] = COLORS_60[v as string]?.hex || (v as string)
            })
            return (
              <div key={idx} className="flex items-center gap-3 bg-white border border-warm-400 rounded-2xl p-3 shadow-warm-sm">
                <MannequinSVG outfit={outfitHex} size={60} />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-warm-900">{item.name || `코디 #${idx + 1}`}</div>
                  {item.score && <div className="text-xs text-terra-600 font-medium mt-0.5">{item.score}점</div>}
                  <div className="flex gap-1 mt-1">{Object.values(item.outfit || item.colors || {}).filter(Boolean).slice(0, 5).map((ck, i) => {
                    const c = COLORS_60[ck as string]; return c ? <div key={i} className="w-3 h-3 rounded-full border border-warm-400/50" style={{ background: c.hex }} /> : null
                  })}</div>
                </div>
              </div>
            )
          })}
        </div>
      ) : <div className="text-center py-16"><Star size={40} className="text-warm-400 mx-auto mb-3" /><div className="text-sm text-warm-600">저장한 코디가 없어요</div></div>}
    </div>
  )
}
