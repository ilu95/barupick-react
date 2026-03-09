import { useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Pencil, Trash2, Share, Globe, Calendar, Tag, Smile, Cloud, ArrowLeft } from 'lucide-react'
import MannequinSVG from '@/components/mannequin/MannequinSVG'
import { COLORS_60 } from '@/lib/colors'
import { CATEGORY_NAMES } from '@/lib/categories'
import { useOotd } from '@/hooks/useOotd'

export default function OotdDetail() {
  const navigate = useNavigate()
  const { date } = useParams()
  const [searchParams] = useSearchParams()
  const recordId = searchParams.get('id')
  const { getRecords, deleteRecord } = useOotd()

  const records = getRecords().filter(r => r.date === date)
  const record = recordId ? records.find(r => r.id === recordId) : records[0]

  if (!record) {
    return (
      <div className="animate-screen-fade px-5 pt-6 pb-10 text-center py-20">
        <div className="text-4xl mb-3">📝</div>
        <div className="text-sm text-warm-600 mb-4">기록을 찾을 수 없어요</div>
        <button onClick={() => navigate('/closet')} className="px-5 py-2 bg-terra-500 text-white rounded-full text-sm font-semibold active:scale-95 transition-all">
          옷장으로
        </button>
      </div>
    )
  }

  // 마네킹용 hex
  const outfitHex: Record<string, string> = {}
  Object.entries(record.colors || {}).forEach(([k, v]) => {
    if (v) { const c = COLORS_60[v]; if (c) outfitHex[k] = c.hex }
  })

  const dateObj = new Date(record.date)
  const dateLabel = dateObj.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

  const handleDelete = () => {
    if (!confirm('이 기록을 삭제할까요?')) return
    deleteRecord(record.id)
    navigate('/closet', { replace: true })
  }

  // 같은 날짜에 여러 기록이 있으면 리스트 표시
  if (records.length > 1 && !recordId) {
    return (
      <div className="animate-screen-fade px-5 pt-2 pb-10">
        <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-1">{dateLabel}</h2>
        <p className="text-sm text-warm-600 mb-5">{records.length}개의 기록</p>
        <div className="flex flex-col gap-2.5">
          {records.map(r => {
            const hex: Record<string, string> = {}
            Object.entries(r.colors || {}).forEach(([k, v]) => {
              if (v) { const c = COLORS_60[v]; if (c) hex[k] = c.hex }
            })
            return (
              <button
                key={r.id}
                onClick={() => navigate(`/closet/ootd/${date}?id=${r.id}`)}
                className="flex items-center gap-3 bg-white border border-warm-400 rounded-2xl p-3 shadow-warm-sm active:scale-[0.98] transition-all text-left"
              >
                <MannequinSVG outfit={hex} size={60} />
                <div className="flex-1">
                  <span className="font-display text-sm font-bold text-terra-600">{r.score}점</span>
                  {r.situation && <span className="text-[11px] text-warm-600 ml-2">{r.situation}</span>}
                  {r.memo && <div className="text-[11px] text-warm-500 truncate mt-0.5">{r.memo}</div>}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      {/* 사진 갤러리 */}
      {record.photos && record.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 hide-scrollbar -mx-5 px-5">
          {record.photos.map((photo, idx) => (
            <img
              key={idx}
              src={photo}
              className="w-60 h-80 rounded-2xl object-cover flex-shrink-0"
              alt={`코디 사진 ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* 마네킹 + 점수 */}
      <div className="flex items-center gap-5 mb-5">
        <div className="bg-warm-100 rounded-2xl p-4 flex-shrink-0">
          <MannequinSVG outfit={outfitHex} size={120} />
        </div>
        <div className="flex-1">
          <div className="font-display text-3xl font-bold text-warm-900 mb-1">{record.score}<span className="text-lg text-warm-500">점</span></div>
          <div className="text-sm text-warm-600 mb-3">{dateLabel}</div>

          {/* 컬러 정보 */}
          <div className="flex flex-col gap-1">
            {Object.entries(record.colors || {}).filter(([_, v]) => v).map(([part, colorKey]) => {
              const c = COLORS_60[colorKey as string]
              if (!c) return null
              return (
                <div key={part} className="flex items-center gap-1.5 text-xs">
                  <span className="w-3.5 h-3.5 rounded border border-warm-400" style={{ background: c.hex }} />
                  <span className="text-warm-500 w-7">{(CATEGORY_NAMES as any)?.[part] || part}</span>
                  <span className="text-warm-800">{c.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 메타 정보 */}
      <div className="bg-white border border-warm-400 rounded-2xl p-4 mb-5 shadow-warm-sm space-y-3">
        {record.situation && (
          <div className="flex items-center gap-2 text-sm">
            <Tag size={14} className="text-warm-500" />
            <span className="text-warm-800">{record.situation}</span>
          </div>
        )}
        {record.mood && (
          <div className="flex items-center gap-2 text-sm">
            <Smile size={14} className="text-warm-500" />
            <span className="text-warm-800">{record.mood}</span>
          </div>
        )}
        {record.weather && (
          <div className="flex items-center gap-2 text-sm">
            <Cloud size={14} className="text-warm-500" />
            <span className="text-warm-800">{record.weather}</span>
          </div>
        )}
        {record.memo && (
          <div className="text-sm text-warm-700 bg-warm-100 rounded-xl px-3 py-2">💬 {record.memo}</div>
        )}
      </div>

      {/* 액션 */}
      <div className="flex gap-2.5 mb-5">
        <button
          onClick={() => { const r = record; localStorage.setItem("_ootd_edit", JSON.stringify(r)); navigate("/record?edit=" + r.id) }}
          className="flex-1 py-3 bg-white border border-warm-400 rounded-2xl text-sm font-medium text-warm-800 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
        >
          <Pencil size={14} /> 수정
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 py-3 bg-white border border-red-200 rounded-2xl text-sm font-medium text-red-600 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
        >
          <Trash2 size={14} /> 삭제
        </button>
      </div>

      <button
        className="w-full py-3 bg-warm-900 text-white rounded-2xl font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
      >
        <Globe size={16} /> 커뮤니티에 공유
      </button>
    </div>
  )
}
