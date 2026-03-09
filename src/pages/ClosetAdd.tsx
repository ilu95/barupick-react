import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Edit3, ArrowLeft } from 'lucide-react'
import ColorPicker from '@/components/ui/ColorPicker'
import { COLORS_60 } from '@/lib/colors'

const CATEGORIES = ['상의', '하의', '아우터', '미들웨어', '신발', '가방', '기타']

export default function ClosetAdd() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'select' | 'manual'>('select')
  const [category, setCategory] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!category || !color) return
    try {
      const items = JSON.parse(localStorage.getItem('sp_wardrobe') || '[]')
      items.push({ category, color, addedAt: Date.now() })
      localStorage.setItem('sp_wardrobe', JSON.stringify(items))
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        setCategory(null)
        setColor(null)
        setMode('select')
      }, 1000)
    } catch {}
  }

  if (saved) {
    return (
      <div className="animate-screen-fade flex items-center justify-center py-32">
        <div className="text-center">
          <div className="text-4xl mb-3">✅</div>
          <div className="font-display text-lg font-bold text-warm-900">등록 완료!</div>
        </div>
      </div>
    )
  }

  if (mode === 'select') {
    return (
      <div className="animate-screen-fade px-5 pt-2 pb-10">
        <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-2">아이템 등록</h2>
        <p className="text-sm text-warm-600 mb-6">등록 방법을 선택해주세요</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {/* 사진 등록은 추후 구현 */ alert('사진 등록은 곧 지원될 예정이에요') }}
            className="w-full flex items-center gap-4 bg-white border border-warm-400 rounded-2xl p-5 text-left shadow-warm-sm active:scale-[0.98] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-terra-100 flex items-center justify-center flex-shrink-0">
              <Camera size={24} className="text-terra-600" />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-warm-900">사진으로 등록</div>
              <div className="text-xs text-warm-600 mt-0.5">사진에서 색상을 자동 추출해요</div>
            </div>
          </button>

          <button
            onClick={() => setMode('manual')}
            className="w-full flex items-center gap-4 bg-white border border-warm-400 rounded-2xl p-5 text-left shadow-warm-sm active:scale-[0.98] transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-warm-300 flex items-center justify-center flex-shrink-0">
              <Edit3 size={24} className="text-warm-700" />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-warm-900">직접 등록</div>
              <div className="text-xs text-warm-600 mt-0.5">카테고리와 색상을 직접 선택해요</div>
            </div>
          </button>
        </div>
      </div>
    )
  }

  // 직접 등록 모드
  return (
    <div className="animate-screen-enter px-5 pt-2 pb-10">
      <button onClick={() => setMode('select')} className="flex items-center gap-1 text-sm text-warm-600 mb-4 active:opacity-70">
        <ArrowLeft size={16} /> 뒤로
      </button>

      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-5">직접 등록</h2>

      {/* 카테고리 */}
      <div className="mb-5">
        <div className="text-xs font-semibold text-warm-600 tracking-widest uppercase mb-2">카테고리</div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                category === cat ? 'bg-terra-500 text-white shadow-terra' : 'bg-white border border-warm-400 text-warm-700 active:scale-95'
              }`}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* 색상 */}
      {category && (
        <div className="mb-5">
          <div className="text-xs font-semibold text-warm-600 tracking-widest uppercase mb-2">
            색상 {color && <span className="text-terra-600 normal-case tracking-normal">— {COLORS_60[color]?.name}</span>}
          </div>
          <ColorPicker
            inline
            selected={color}
            onSelect={setColor}
            onClear={() => setColor(null)}
          />
        </div>
      )}

      {/* 저장 */}
      {category && color && (
        <button
          onClick={handleSave}
          className="w-full py-3.5 bg-terra-500 text-white rounded-2xl font-semibold text-sm active:scale-[0.98] transition-all shadow-terra"
        >
          등록하기
        </button>
      )}
    </div>
  )
}
