import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, Star, ChevronLeft, ChevronRight, Shirt, Trash2 } from 'lucide-react'
import MannequinSVG from '@/components/mannequin/MannequinSVG'
import { COLORS_60 } from '@/lib/colors'
import { useOotd, type OotdRecord } from '@/hooks/useOotd'

type ClosetTab = 'wardrobe' | 'records'

export default function Closet() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<ClosetTab>('records')

  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      {/* 세그먼트 컨트롤 */}
      <div className="relative flex bg-warm-200 rounded-xl p-1 mb-5">
        <div
          className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-white rounded-lg shadow-warm-sm transition-transform duration-200"
          style={{ transform: tab === 'wardrobe' ? 'translateX(0)' : 'translateX(100%)' }}
        />
        <button
          onClick={() => setTab('wardrobe')}
          className={`relative z-10 flex-1 py-2.5 text-[13px] font-semibold text-center rounded-lg transition-colors ${
            tab === 'wardrobe' ? 'text-warm-900' : 'text-warm-600'
          }`}
        >내 옷장</button>
        <button
          onClick={() => setTab('records')}
          className={`relative z-10 flex-1 py-2.5 text-[13px] font-semibold text-center rounded-lg transition-colors ${
            tab === 'records' ? 'text-warm-900' : 'text-warm-600'
          }`}
        >코디 기록</button>
      </div>

      {tab === 'wardrobe' && <WardrobeTab navigate={navigate} />}
      {tab === 'records' && <RecordsTab navigate={navigate} />}
    </div>
  )
}

// ═══════════════════════════════════════
// 내 옷장 탭
// ═══════════════════════════════════════
function WardrobeTab({ navigate }: { navigate: any }) {
  const items = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('sp_wardrobe') || '[]') } catch { return [] }
  }, [])
  const [filter, setFilter] = useState<string | null>(null)

  const categories = ['상의', '하의', '아우터', '신발', '가방', '기타']
  const filtered = filter ? items.filter((i: any) => i.category === filter) : items

  return (
    <div>
      {/* 카테고리 필터 */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 hide-scrollbar">
        <button
          onClick={() => setFilter(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
            !filter ? 'bg-warm-900 text-white' : 'bg-warm-100 border border-warm-300 text-warm-600 active:scale-95'
          }`}
        >전체 ({items.length})</button>
        {categories.map(cat => {
          const count = items.filter((i: any) => i.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => setFilter(filter === cat ? null : cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                filter === cat ? 'bg-warm-900 text-white' : 'bg-warm-100 border border-warm-300 text-warm-600 active:scale-95'
              }`}
            >{cat} ({count})</button>
          )
        })}
      </div>

      {/* 아이템 그리드 */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-3 gap-2.5">
          {filtered.map((item: any, idx: number) => {
            const c = COLORS_60[item.color]
            return (
              <div key={idx} className="bg-white border border-warm-400 rounded-2xl p-3 text-center shadow-warm-sm">
                <div className="w-10 h-10 rounded-lg mx-auto mb-2 border border-warm-300" style={{ background: c?.hex || '#ccc' }} />
                <div className="text-[11px] font-semibold text-warm-900 truncate">{c?.name || item.color}</div>
                <div className="text-[10px] text-warm-500">{item.category}</div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Shirt size={40} className="text-warm-400 mx-auto mb-3" />
          <div className="text-sm text-warm-600 mb-4">옷장이 비어있어요</div>
          <button
            onClick={() => navigate('/closet/add')}
            className="px-5 py-2.5 bg-terra-500 text-white rounded-full text-sm font-semibold active:scale-95 transition-all shadow-terra"
          >첫 아이템 등록하기</button>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => navigate('/closet/add')}
        className="fixed bottom-24 right-5 max-w-[480px] w-12 h-12 rounded-full bg-terra-500 text-white flex items-center justify-center shadow-terra active:scale-90 transition-transform z-50"
        style={{ right: 'max(20px, calc((100vw - 480px) / 2 + 20px))' }}
      >
        <Plus size={24} />
      </button>
    </div>
  )
}

// ═══════════════════════════════════════
// 코디 기록 탭
// ═══════════════════════════════════════
function RecordsTab({ navigate }: { navigate: any }) {
  const { getRecords } = useOotd()
  const records = getRecords()

  return (
    <div>
      {/* 캘린더 + 베스트 카드 */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <button
          onClick={() => navigate('/closet/calendar')}
          className="bg-white border border-warm-400 rounded-2xl p-4 text-center shadow-warm-sm active:scale-[0.97] transition-all"
        >
          <Calendar size={24} className="text-terra-500 mx-auto mb-2" />
          <div className="text-[13px] font-semibold text-warm-900">코디 캘린더</div>
          <div className="text-[10px] text-warm-500 mt-0.5">날짜별 기록 보기</div>
        </button>
        <button
          onClick={() => navigate('/closet/best')}
          className="bg-white border border-warm-400 rounded-2xl p-4 text-center shadow-warm-sm active:scale-[0.97] transition-all"
        >
          <Star size={24} className="text-terra-500 mx-auto mb-2" />
          <div className="text-[13px] font-semibold text-warm-900">베스트 코디</div>
          <div className="text-[10px] text-warm-500 mt-0.5">높은 점수순</div>
        </button>
      </div>

      {/* 최근 기록 리스트 */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-warm-600 tracking-widest uppercase mb-3">
        최근 기록 ({records.length})
      </div>

      {records.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {records.slice(0, 20).map(record => (
            <RecordCard key={record.id} record={record} navigate={navigate} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📝</div>
          <div className="text-sm text-warm-600 mb-4">아직 기록이 없어요</div>
          <button
            onClick={() => navigate('/record')}
            className="px-5 py-2.5 bg-terra-500 text-white rounded-full text-sm font-semibold active:scale-95 transition-all shadow-terra"
          >첫 OOTD 기록하기</button>
        </div>
      )}
    </div>
  )
}

// ─── 기록 카드 ───
function RecordCard({ record, navigate }: { record: OotdRecord, navigate: any }) {
  const outfitHex: Record<string, string> = {}
  Object.entries(record.colors || {}).forEach(([k, v]) => {
    if (v) { const c = COLORS_60[v]; if (c) outfitHex[k] = c.hex }
  })

  const dateLabel = (() => {
    const today = new Date()
    const d = new Date(record.date)
    const diff = Math.floor((today.getTime() - d.getTime()) / 86400000)
    if (diff === 0) return '오늘'
    if (diff === 1) return '어제'
    if (diff < 7) return `${diff}일 전`
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  })()

  return (
    <button
      onClick={() => navigate(`/closet/ootd/${record.date}?id=${record.id}`)}
      className="w-full flex items-center gap-3 bg-white border border-warm-400 rounded-2xl p-3 shadow-warm-sm active:scale-[0.98] transition-all text-left"
    >
      {/* 마네킹 미리보기 */}
      <MannequinSVG outfit={outfitHex} size={60} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[13px] font-semibold text-warm-900">{dateLabel}</span>
          <span className="font-display text-[11px] font-bold text-terra-600 bg-terra-100 px-2 py-0.5 rounded-full">{record.score}점</span>
        </div>
        {record.situation && <div className="text-[11px] text-warm-600 mb-0.5">{record.situation}</div>}
        {record.weather && <div className="text-[11px] text-warm-500">{record.weather}</div>}
        {record.situation && <div className="text-[11px] text-warm-600 mb-0.5">{record.situation}</div>}
        {record.memo && <div className="text-[11px] text-warm-500 truncate">{record.memo}</div>}

        {/* 컬러 도트 */}
        <div className="flex gap-1 mt-1.5">
          {Object.values(record.colors || {}).filter(Boolean).map((colorKey, i) => {
            const c = COLORS_60[colorKey as string]
            return c ? (
              <div key={i} className="w-3 h-3 rounded-full border border-warm-400/50" style={{ background: c.hex }} />
            ) : null
          })}
        </div>
      </div>

      {/* 사진 썸네일 */}
      {record.photos && record.photos.length > 0 && (
        <img src={record.photos[0]} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="" />
      )}
    </button>
  )
}
