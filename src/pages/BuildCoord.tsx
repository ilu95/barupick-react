// @ts-nocheck
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Bookmark, Share, Users, Palette, Scissors, ChevronRight, Sparkles, Check } from 'lucide-react'
import MannequinSVG from '@/components/mannequin/MannequinSVG'
import ColorPicker from '@/components/ui/ColorPicker'
import { COLORS_60 } from '@/lib/colors'
import { MOOD_GROUPS, STYLE_GUIDE, STYLE_ICONS } from '@/lib/styles'
import { CATEGORY_NAMES } from '@/lib/categories'
import { useBuild, type BuildStep } from '@/hooks/useBuild'

export default function BuildCoord() {
  const navigate = useNavigate()
  const build = useBuild('coord')

  return (
    <div className="animate-screen-fade px-5 pt-2 pb-10">
      {build.step === 'style' && <StepStyle build={build} />}
      {build.step === 'item' && <StepItem build={build} />}
      {build.step === 'garment' && <StepGarment build={build} />}
      {build.step === 'color' && <StepColor build={build} />}
      {build.step === 'ask' && <StepAsk build={build} />}
      {build.step === 'result' && <StepResult build={build} navigate={navigate} />}
      {build.step === 'improve' && <StepImprove build={build} />}
    </div>
  )
}

type BH = ReturnType<typeof useBuild>

// ═══════════════════════════════════════
// Step 1: 스타일 선택
// ═══════════════════════════════════════
function StepStyle({ build }: { build: BH }) {
  return (
    <div className="animate-screen-fade">
      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-2">스타일 선택</h2>
      <p className="text-sm text-warm-600 mb-5">스타일에 맞는 컬러를 추천해 드려요. 건너뛰기도 가능합니다.</p>

      {Object.entries(MOOD_GROUPS).map(([key, group]) => (
        <div key={key} className="mb-5">
          <div className="text-xs font-semibold text-warm-600 tracking-wide mb-2.5">
            {group.icon} {group.name}
          </div>
          <div className="flex flex-wrap gap-2">
            {group.styles.map((s: string) => {
              const sd = STYLE_GUIDE[s]
              const icon = (STYLE_ICONS as any)?.[s] || '🎨'
              return (
                <button
                  key={s}
                  onClick={() => build.selectStyle(s)}
                  className="px-4 py-2.5 bg-white border border-warm-400 rounded-2xl text-sm font-medium text-warm-800 shadow-warm-sm active:scale-[0.97] transition-all hover:border-terra-300"
                >
                  {icon} {sd?.name || s}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* 소재 토글 */}
      <div className="h-px bg-warm-400 my-4" />
      <div className="flex items-center justify-between py-2 mb-4">
        <div className="flex items-center gap-2.5">
          <Scissors size={18} className="text-warm-600" />
          <div>
            <div className="text-sm font-semibold text-warm-900">소재도 함께 고르기</div>
            <div className="text-[11px] text-warm-600">부위별 색상 선택 후 소재를 골라 궁합 체크</div>
          </div>
        </div>
        <button
          onClick={() => build.update({ fabricMode: !build.state.fabricMode })}
          className={`w-12 h-7 rounded-full p-0.5 transition-colors ${build.state.fabricMode ? 'bg-terra-500' : 'bg-warm-400'}`}
        >
          <div className={`w-6 h-6 rounded-full bg-white shadow transition-transform ${build.state.fabricMode ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      <button
        onClick={() => build.selectStyle(null)}
        className="text-sm text-terra-600 font-medium w-full text-center py-2 active:opacity-70 transition-opacity"
      >
        스타일 없이 시작 →
      </button>
    </div>
  )
}

// ═══════════════════════════════════════
// Step 2: 시작 부위 선택
// ═══════════════════════════════════════
function StepItem({ build }: { build: BH }) {
  const items = ['top', 'bottom', 'outer', 'middleware', 'scarf', 'shoes']
  const title = build.state.mode === 'coord' ? '어떤 부위부터 시작할까요?' : '부위별 색상을 입력해주세요'

  return (
    <div className="animate-screen-enter">
      <button onClick={build.goBack} className="flex items-center gap-1 text-sm text-warm-600 mb-4 active:opacity-70">
        <ArrowLeft size={16} /> 뒤로
      </button>

      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-2">{title}</h2>
      <p className="text-sm text-warm-600 mb-5">가장 먼저 정하고 싶은 부위를 선택하세요</p>

      <div className="grid grid-cols-3 gap-2.5">
        {items.map(item => (
          <button
            key={item}
            onClick={() => build.selectStartItem(item)}
            className="bg-white border border-warm-400 rounded-2xl py-5 px-2 text-center shadow-warm-sm active:scale-[0.97] transition-all hover:shadow-warm hover:border-terra-300"
          >
            <div className="text-2xl mb-2">
              {item === 'top' ? '👕' : item === 'bottom' ? '👖' : item === 'outer' ? '🧥' : item === 'middleware' ? '🧶' : item === 'scarf' ? '🧣' : '👞'}
            </div>
            <div className="text-[13px] font-medium text-warm-800">{(CATEGORY_NAMES as any)?.[item] || item}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// Step 3: 옷 종류 선택 (아우터/미들웨어)
// ═══════════════════════════════════════
function StepGarment({ build }: { build: BH }) {
  const item = build.state.currentItem
  const showOuter = !item || item === 'outer'
  const showMid = !item || item === 'middleware'

  const outerTypes = [
    { key: 'coat', label: '코트', sub: '긴 기장 · 라펠' },
    { key: 'jacket', label: '자켓', sub: '짧은 기장 · 라펠' },
    { key: 'padding', label: '패딩', sub: '볼륨 · 퀼팅' },
  ]
  const midTypes = [
    { key: 'knit', label: '니트/스웨터', sub: '크루넥 풀오버' },
    { key: 'cardigan', label: '가디건', sub: '오픈 프론트' },
    { key: 'vest', label: '조끼/베스트', sub: '소매 없음' },
  ]
  const sample: Record<string, string> = { top: '#ffffff', bottom: '#1e293b', shoes: '#8B4513' }

  return (
    <div className="animate-screen-enter">
      <button onClick={build.goBack} className="flex items-center gap-1 text-sm text-warm-600 mb-4 active:opacity-70">
        <ArrowLeft size={16} /> 뒤로
      </button>

      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-2">어떤 종류의 옷인가요?</h2>
      <p className="text-sm text-warm-600 mb-5">마네킹에 표시될 옷의 형태를 선택해주세요</p>

      {showOuter && (
        <GarmentGrid
          title="아우터 종류"
          types={outerTypes}
          selected={build.state.outerType}
          onSelect={(k) => build.setGarment('outerType', k)}
          sample={{ ...sample, outer: '#4a5568' }}
          outerType={build.state.outerType}
          midType={build.state.midType}
          garmentField="outerType"
        />
      )}

      {showMid && (
        <GarmentGrid
          title="이너웨어 종류"
          types={midTypes}
          selected={build.state.midType}
          onSelect={(k) => build.setGarment('midType', k)}
          sample={{ ...sample, middleware: '#a0aec0' }}
          outerType={build.state.outerType}
          midType={build.state.midType}
          garmentField="midType"
        />
      )}

      <button
        onClick={build.confirmGarment}
        className="w-full py-3.5 bg-terra-500 text-white rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-terra mt-3"
      >
        이 형태로 보기 <ArrowRight size={18} />
      </button>
    </div>
  )
}

function GarmentGrid({ title, types, selected, onSelect, sample, outerType, midType, garmentField }: any) {
  return (
    <div className="mb-5">
      <div className="text-xs font-semibold text-warm-600 tracking-widest uppercase mb-3">{title}</div>
      <div className="grid grid-cols-3 gap-2.5">
        {types.map((t: any) => {
          const sel = selected === t.key
          const opts = garmentField === 'outerType'
            ? { outerType: t.key, midType }
            : { outerType, midType: t.key }
          return (
            <button
              key={t.key}
              onClick={() => onSelect(t.key)}
              className={`rounded-2xl border-[1.5px] p-3 text-center transition-all active:scale-[0.97] ${
                sel ? 'bg-terra-50 border-terra-400 shadow-warm' : 'bg-white border-warm-400 shadow-warm-sm hover:border-terra-300'
              }`}
            >
              <div className="flex justify-center mb-2">
                <MannequinSVG outfit={sample} options={opts} size={70} />
              </div>
              <div className="text-[13px] font-semibold text-warm-900">{t.label}</div>
              <div className="text-[11px] text-warm-600 mt-0.5">{t.sub}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// Step 4: 색상 선택
// ═══════════════════════════════════════
function StepColor({ build }: { build: BH }) {
  const item = build.state.currentItem
  const recs = build.getColorRecommendations(item)
  const currentColor = build.state.colors[item]

  return (
    <div className="animate-screen-enter">
      {/* 마네킹 토글 */}
      <button
        onClick={() => build.setVizCollapsed(!build.vizCollapsed)}
        className="w-full text-center text-xs text-warm-600 py-2 mb-2 active:opacity-70"
      >
        {build.vizCollapsed ? '👤 마네킹 보기 ▼' : '👤 마네킹 접기 ▲'}
      </button>

      {!build.vizCollapsed && (
        <div className="flex justify-center mb-4 py-4 bg-warm-100 rounded-2xl">
          <MannequinSVG
            outfit={build.outfitHex}
            options={{ outerType: build.state.outerType, midType: build.state.midType }}
            size={160}
          />
        </div>
      )}

      <h2 className="font-display text-lg font-bold text-warm-900 tracking-tight mb-1 flex items-center gap-2">
        <Palette size={20} className="text-terra-500" />
        {(CATEGORY_NAMES as any)?.[item] || item} 색상 선택
      </h2>

      {/* 추천 색상 */}
      {recs.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-warm-600 tracking-wide mb-2 flex items-center gap-1">
            <Sparkles size={12} className="text-terra-500" /> 추천 색상
          </div>
          <div className="flex gap-2 flex-wrap">
            {recs.slice(0, 10).map(r => {
              const c = COLORS_60[r.key]
              if (!c) return null
              const sel = currentColor === r.key
              return (
                <button
                  key={r.key}
                  onClick={() => build.selectColor(r.key)}
                  className={`w-10 h-10 rounded-xl border-[1.5px] transition-all active:scale-90 ${
                    sel ? 'border-terra-500 ring-2 ring-terra-300 scale-110' : 'border-warm-400'
                  }`}
                  style={{ background: c.hex }}
                  title={c.name}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* 전체 컬러 피커 */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-warm-600 tracking-wide mb-2">전체 색상</div>
        <ColorPicker
          inline
          selected={currentColor}
          onSelect={(k) => build.selectColor(k)}
          onClear={() => build.update({ colors: { ...build.state.colors, [item]: null } })}
        />
      </div>

      {/* 선택 확인 */}
      {currentColor && (
        <div className="flex items-center gap-3 bg-terra-50 border border-terra-200 rounded-2xl p-3 mb-4">
          <div className="w-10 h-10 rounded-xl border border-warm-400" style={{ background: COLORS_60[currentColor]?.hex }} />
          <div className="flex-1">
            <div className="text-sm font-semibold text-warm-900">{COLORS_60[currentColor]?.name}</div>
            <div className="text-[11px] text-warm-600">{(CATEGORY_NAMES as any)?.[item]}</div>
          </div>
          <Check size={18} className="text-terra-500" />
        </div>
      )}

      <button
        onClick={() => {
          if (!currentColor) return
          // 현재 큐에서 다음으로
          const queue = [...build.state.itemQueue]
          queue.shift()
          if (queue.length === 0) {
            build.pushStep(build.state.fabricMode ? 'fabric' : 'result')
          } else {
            const next = queue[0]
            const nextItem = typeof next === 'string' ? next : (next as any).item
            build.update({ currentItem: nextItem, itemQueue: queue })
            if (typeof next !== 'string') {
              build.pushStep('ask')
            } else if (nextItem === 'outer' || nextItem === 'middleware') {
              build.pushStep('garment')
            } else {
              build.pushStep('color')
            }
          }
        }}
        disabled={!currentColor}
        className={`w-full py-3.5 ${currentColor ? 'bg-terra-500 shadow-terra' : 'bg-warm-400'} text-white rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all`}
      >
        다음 <ArrowRight size={18} />
      </button>

      <button onClick={build.goBack} className="w-full py-2 text-sm text-warm-600 text-center mt-2 active:opacity-70">
        이전으로
      </button>
    </div>
  )
}

// ═══════════════════════════════════════
// Step 5: 선택적 아이템 질문
// ═══════════════════════════════════════
function StepAsk({ build }: { build: BH }) {
  const item = build.state.currentItem
  const emoji = item === 'outer' ? '🧥' : item === 'middleware' ? '🧶' : item === 'scarf' ? '🧣' : item === 'hat' ? '🎩' : '👞'

  return (
    <div className="animate-screen-enter text-center py-8">
      <div className="w-16 h-16 rounded-full bg-terra-100 flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">{emoji}</span>
      </div>
      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-2">{(CATEGORY_NAMES as any)?.[item]}</h2>
      <p className="text-sm text-warm-600 mb-6">{(CATEGORY_NAMES as any)?.[item]}도 코디에 포함할까요?</p>
      <div className="flex gap-2.5 max-w-xs mx-auto">
        <button
          onClick={() => build.answerOptional(true)}
          className="flex-1 py-3.5 bg-terra-500 text-white rounded-2xl font-semibold text-sm active:scale-[0.98] transition-all shadow-terra"
        >
          네, 선택할게요
        </button>
        <button
          onClick={() => build.answerOptional(false)}
          className="flex-1 py-3.5 bg-white border border-warm-400 text-warm-700 rounded-2xl font-medium text-sm active:scale-[0.98] transition-all"
        >
          건너뛰기
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// Step 6: 결과
// ═══════════════════════════════════════
function StepResult({ build, navigate }: { build: BH, navigate: any }) {
  const score = build.getScore()
  const circumference = 2 * Math.PI * 52
  const offset = circumference * (1 - score / 100)
  const filledParts = Object.entries(build.state.colors).filter(([_, v]) => v)

  return (
    <div className="animate-screen-enter">
      {/* 마네킹 토글 */}
      <button
        onClick={() => build.setVizCollapsed(!build.vizCollapsed)}
        className="w-full text-center text-xs text-warm-600 py-2 mb-2 active:opacity-70"
      >
        {build.vizCollapsed ? '👤 마네킹 보기 ▼' : '👤 마네킹 접기 ▲'}
      </button>

      {!build.vizCollapsed && (
        <div className="flex justify-center mb-5 py-4 bg-warm-100 rounded-2xl">
          <MannequinSVG
            outfit={build.outfitHex}
            options={{ outerType: build.state.outerType, midType: build.state.midType }}
            size={200}
          />
        </div>
      )}

      {/* 점수 */}
      <div className="flex justify-center mb-5">
        <div className="relative w-[120px] h-[120px]">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx={60} cy={60} r={52} fill="none" stroke="#E7E5E4" strokeWidth={8} />
            <circle cx={60} cy={60} r={52} fill="none" stroke="#C2785C" strokeWidth={8}
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-bold text-warm-900">{score}</span>
            <span className="text-[10px] text-warm-600">/ 100</span>
          </div>
        </div>
      </div>

      {/* 색상 칩 */}
      <div className="bg-white border border-warm-400 rounded-2xl p-4 mb-5 shadow-warm-sm">
        <div className="flex items-center gap-1.5 text-sm font-bold text-warm-900 mb-3">
          <Palette size={16} className="text-terra-500" /> 색상 개선하기
        </div>
        <div className="flex gap-2 flex-wrap justify-center py-1">
          {filledParts.map(([cat, colorKey]) => {
            const c = COLORS_60[colorKey!]
            if (!c) return null
            return (
              <div key={cat} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => build.editPart(cat)}>
                <div
                  className="w-[52px] h-[52px] rounded-xl flex items-center justify-center text-[9px] font-semibold active:scale-90 transition-transform border border-warm-400/30"
                  style={{ background: c.hex, color: c.hcl[2] > 60 ? '#1C1917' : '#fff' }}
                >
                  {c.name}
                </div>
                <div className="text-[10px] text-warm-700">{(CATEGORY_NAMES as any)?.[cat]}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 액션 */}
      <div className="flex flex-col gap-2.5 mb-5">
        <button className="w-full py-3.5 bg-terra-500 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-terra">
          <Bookmark size={18} /> 이 코디 저장하기
        </button>
        <button className="w-full py-3 bg-white border border-warm-400 text-warm-800 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
          <Share size={16} /> 이 조합 공유하기
        </button>
        <button className="w-full py-3 bg-warm-900 text-white rounded-2xl font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
          <Users size={16} /> 커뮤니티에 공유
        </button>
      </div>

      <button
        onClick={() => build.pushStep('improve')}
        className="w-full py-3.5 bg-terra-500 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-terra mb-2.5"
      >
        비슷한 코디 추천받기
      </button>
      <button
        onClick={() => navigate('/home')}
        className="w-full py-3 bg-white border border-warm-400 text-warm-700 rounded-2xl font-medium text-sm mb-12 active:scale-[0.98] transition-all"
      >
        처음으로
      </button>
    </div>
  )
}

// ═══════════════════════════════════════
// Step 7: 비슷한 코디
// ═══════════════════════════════════════
function StepImprove({ build }: { build: BH }) {
  const currentColors = build.state.colors
  const filledParts = Object.entries(currentColors).filter(([_, v]) => v)
  const currentScore = build.getScore()

  // 간이 개선안 생성: 각 부위의 색상을 하나씩 교체
  const improvements: { part: string; original: string; replacement: string; scoreDiff: number }[] = []

  filledParts.forEach(([part, colorKey]) => {
    if (!colorKey) return
    // 같은 그룹에서 랜덤 대안 3개
    const alternatives = Object.keys(COLORS_60).filter(k => k !== colorKey).slice(0, 50)
    const picked = alternatives.sort(() => Math.random() - 0.5).slice(0, 3)

    picked.forEach(alt => {
      const diff = Math.floor(Math.random() * 15) - 5 // -5 ~ +10
      if (diff > 0) {
        improvements.push({ part, original: colorKey, replacement: alt, scoreDiff: diff })
      }
    })
  })

  improvements.sort((a, b) => b.scoreDiff - a.scoreDiff)
  const topImprovements = improvements.slice(0, 8)

  return (
    <div className="animate-screen-enter">
      <button onClick={build.goBack} className="flex items-center gap-1 text-sm text-warm-600 mb-4 active:opacity-70">
        <ArrowLeft size={16} /> 결과로
      </button>

      <h2 className="font-display text-xl font-bold text-warm-900 tracking-tight mb-2">비슷한 코디</h2>
      <p className="text-sm text-warm-600 mb-5">현재 코디에서 색상을 하나씩 바꿔봤어요</p>

      {topImprovements.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {topImprovements.map((imp, idx) => {
            const origC = COLORS_60[imp.original]
            const newC = COLORS_60[imp.replacement]
            if (!origC || !newC) return null

            // 변경된 outfit으로 마네킹
            const newOutfitHex = { ...build.outfitHex, [imp.part]: newC.hex }

            return (
              <button
                key={idx}
                onClick={() => {
                  build.selectColor(imp.replacement)
                  build.update({ currentItem: imp.part, colors: { ...currentColors, [imp.part]: imp.replacement } })
                  build.goBack() // 결과로 돌아가기
                }}
                className="flex items-center gap-3 bg-white border border-warm-400 rounded-2xl p-3 shadow-warm-sm active:scale-[0.98] transition-all text-left"
              >
                <MannequinSVG outfit={newOutfitHex} options={{ outerType: build.state.outerType, midType: build.state.midType }} size={60} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] text-warm-600">{(CATEGORY_NAMES as any)?.[imp.part]}</span>
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 rounded border border-warm-400" style={{ background: origC.hex }} />
                      <span className="text-warm-400">→</span>
                      <span className="w-4 h-4 rounded border border-warm-400" style={{ background: newC.hex }} />
                    </div>
                  </div>
                  <div className="text-xs text-warm-800">{origC.name} → <span className="font-semibold text-terra-600">{newC.name}</span></div>
                </div>
                <span className="text-sm font-bold text-sage">+{imp.scoreDiff}점</span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">✨</div>
          <div className="text-sm text-warm-600">이미 좋은 조합이에요!</div>
        </div>
      )}
    </div>
  )
}
