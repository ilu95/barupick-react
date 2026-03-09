// @ts-nocheck
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
import { COLORS_60 } from '@/lib/colors'
import { PERSONAL_COLOR_12 } from '@/lib/personalColor'
import { profile } from '@/lib/profile'

// 간이 드레이핑 테스트 — 4단계 질문으로 12계절 결정
const QUESTIONS = [
  {
    q: '피부에 가까이 대었을 때\n더 화사해 보이는 색은?',
    desc: '화면 밝기를 최대로 올리고, 각 색상을 얼굴 아래에 대보세요',
    options: [
      { label: '피치/살구색', colors: ['#FFD4B2', '#FFDAB9'], value: 'warm', hex: '#FFD4B2' },
      { label: '라벤더/로즈', colors: ['#D8BFD8', '#FFC1CC'], value: 'cool', hex: '#D8BFD8' },
    ],
  },
  {
    q: '금색과 은색 중\n어떤 액세서리가 더 어울리나요?',
    desc: '실제 액세서리가 있다면 대보세요',
    options: [
      { label: '골드가 더 어울려요', colors: ['#FFD700', '#DAA520'], value: 'warm', hex: '#FFD700' },
      { label: '실버가 더 어울려요', colors: ['#C0C0C0', '#A9A9A9'], value: 'cool', hex: '#C0C0C0' },
    ],
  },
  {
    q: '밝은 색과 어두운 색 중\n얼굴이 더 살아 보이는 쪽은?',
    desc: '흰 옷 vs 검정 옷을 떠올려보세요',
    options: [
      { label: '밝은 색이 더 좋아요', colors: ['#FFFFF0', '#FFE5B4'], value: 'light', hex: '#FFFFF0' },
      { label: '어두운 색이 더 좋아요', colors: ['#2F4F4F', '#191970'], value: 'deep', hex: '#2F4F4F' },
    ],
  },
  {
    q: '선명한 색과 부드러운 색 중\n더 잘 어울리는 쪽은?',
    desc: '원색 vs 뮤트톤을 비교해보세요',
    options: [
      { label: '선명하고 강한 색', colors: ['#FF0000', '#0000FF'], value: 'bright', hex: '#FF0000' },
      { label: '부드럽고 탁한 색', colors: ['#BC8F8F', '#B0C4DE'], value: 'muted', hex: '#BC8F8F' },
    ],
  },
]

// 결과 매핑
function getResult(answers: string[]): string {
  const isWarm = answers.filter(a => a === 'warm').length >= answers.filter(a => a === 'cool').length
  const isLight = answers.includes('light')
  const isBright = answers.includes('bright')

  if (isWarm) {
    if (isLight) return 'spring_light'
    if (isBright) return 'spring_bright'
    return 'autumn_true'
  } else {
    if (isLight) return 'summer_light'
    if (isBright) return 'winter_bright'
    return 'summer_muted'
  }
}

export default function PcLight() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [result, setResult] = useState<string | null>(null)

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value]
    setAnswers(newAnswers)

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      // 결과 계산
      const r = getResult(newAnswers)
      setResult(r)
    }
  }

  const goBack = () => {
    if (step > 0) {
      setStep(step - 1)
      setAnswers(answers.slice(0, -1))
    }
  }

  const applyResult = () => {
    if (result) {
      profile.setPersonalColor(result)
      navigate('/profile/personal-color', { replace: true })
    }
  }

  // 결과 화면
  if (result) {
    const pc = PERSONAL_COLOR_12[result]
    const bestColors = (pc?.bestColors || []).slice(0, 8)

    return (
      <div className="animate-screen-fade px-5 pt-2 pb-10">
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-full bg-terra-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} className="text-terra-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-warm-900 tracking-tight mb-2">
            {pc?.name || result}
          </h2>
          <p className="text-sm text-warm-600 leading-relaxed px-4">
            {pc?.description || '퍼스널컬러 진단이 완료되었어요'}
          </p>
        </div>

        {/* 베스트 컬러 */}
        {bestColors.length > 0 && (
          <div className="mb-6">
            <div className="text-xs font-semibold text-warm-600 tracking-widest uppercase mb-3">베스트 컬러</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {bestColors.map((ck: string) => {
                const c = COLORS_60[ck]
                if (!c) return null
                return (
                  <div key={ck} className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-xl border border-warm-400/30" style={{ background: c.hex }} />
                    <span className="text-[10px] text-warm-600">{c.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <button
            onClick={applyResult}
            className="w-full py-3.5 bg-terra-500 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-terra"
          >
            <Check size={18} /> 이 결과로 설정하기
          </button>
          <button
            onClick={() => { setStep(0); setAnswers([]); setResult(null) }}
            className="w-full py-3 bg-white border border-warm-400 text-warm-700 rounded-2xl font-medium text-sm active:scale-[0.98] transition-all"
          >
            다시 진단하기
          </button>
        </div>

        <div className="text-center text-[11px] text-warm-500 mt-4 leading-relaxed">
          이 진단은 간이 테스트예요.<br />정확한 진단은 전문가에게 받아보세요.
        </div>
      </div>
    )
  }

  // 질문 화면
  const q = QUESTIONS[step]

  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      {/* 진행률 */}
      <div className="h-1.5 bg-warm-300 rounded-full mb-6">
        <div className="h-full bg-terra-500 rounded-full transition-all" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
      </div>

      <div className="text-center mb-8">
        <div className="text-[11px] text-warm-500 mb-2">{step + 1} / {QUESTIONS.length}</div>
        <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight leading-snug whitespace-pre-line mb-2">
          {q.q}
        </h2>
        <p className="text-sm text-warm-600">{q.desc}</p>
      </div>

      {/* 선택지 */}
      <div className="flex flex-col gap-3 mb-6">
        {q.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(opt.value)}
            className="w-full flex items-center gap-4 bg-white border border-warm-400 rounded-2xl p-5 text-left shadow-warm-sm active:scale-[0.98] transition-all hover:border-terra-300"
          >
            <div className="flex gap-1.5 flex-shrink-0">
              {opt.colors.map((hex, i) => (
                <div key={i} className="w-10 h-10 rounded-xl border border-warm-400/30" style={{ background: hex }} />
              ))}
            </div>
            <div className="text-sm font-semibold text-warm-900">{opt.label}</div>
            <ArrowRight size={16} className="text-warm-500 ml-auto" />
          </button>
        ))}
      </div>

      {step > 0 && (
        <button onClick={goBack} className="w-full text-center text-sm text-warm-500 active:opacity-70">
          <ArrowLeft size={14} className="inline mr-1" /> 이전 질문
        </button>
      )}
    </div>
  )
}
