import type { Todo } from '../types'
import { calcOverallProgress, calcCategoryProgress } from '../lib/progressUtils'
import ProgressBar from './ProgressBar'
import { CATEGORY_CONFIG } from '../lib/categoryConfig'

type CategoryKey = keyof typeof CATEGORY_CONFIG

function getMotivationalMessage(pct: number): { main: string; sub?: string } {
  if (pct <= 30) return { main: '오늘도 함께 시작해볼까요? 💪' }
  if (pct <= 60) return { main: '잘 하고 있어요! 조금만 더 💕' }
  if (pct <= 90) return { main: '거의 다 왔어요! 대단해요 🌟' }
  return { main: '오늘 할 일을 모두 마쳤어요 🎊', sub: '서로 수고했다고 말해줄까요?' }
}

function CategorySection({ todos, label }: { todos: Todo[]; label: string }) {
  const byCategory = calcCategoryProgress(todos)
  const entries = (Object.entries(byCategory) as [CategoryKey, ReturnType<typeof calcCategoryProgress>[CategoryKey]][])
    .filter(([, s]) => s.total > 0)
  if (entries.length === 0) return null
  return (
    <div className="border-t border-gray-50 pt-4 flex flex-col gap-3">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      {entries.map(([cat, stat]) => (
        <ProgressBar
          key={cat}
          percentage={stat.percentage}
          label={cat}
          color={CATEGORY_CONFIG[cat].hexColor}
          completed={stat.completed}
          total={stat.total}
          size="sm"
        />
      ))}
    </div>
  )
}

interface ProgressDashboardProps {
  todos: Todo[]
  ownerName: string
  partnerTodos?: Todo[]
  partnerName?: string
}

export default function ProgressDashboard({ todos, ownerName, partnerTodos, partnerName }: ProgressDashboardProps) {
  const isCombined = partnerTodos !== undefined

  // ─── 우리 할일 탭: 합산 뷰 ───────────────────────────────────────
  if (isCombined) {
    const allTodos = [...todos, ...partnerTodos]
    const combined = calcOverallProgress(allTodos)
    const myStats = calcOverallProgress(todos)
    const partnerStats = calcOverallProgress(partnerTodos)

    if (allTodos.length === 0) {
      return (
        <div className="bg-white rounded-2xl p-6 border border-orange-100 text-center">
          <p className="text-sm text-gray-400">아직 할일이 없어요. 함께 추가해볼까요? 💑</p>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-2xl p-6 border border-orange-100 flex flex-col gap-5">
        {/* 헤드라인 */}
        <div className="text-center">
          <p className="text-base font-bold text-gray-800">
            오늘 우리 함께 {combined.completed}개 완료했어요 🎉
          </p>
          <p className="text-xs text-gray-400 mt-0.5">전체 {combined.total}개 중</p>
        </div>

        {/* 합산 진행 바 */}
        <ProgressBar percentage={combined.percentage} label="" color="#f97316" size="lg" />

        {/* 감성 문구 */}
        <div className="text-center">
          <p className="text-sm text-gray-500">{getMotivationalMessage(combined.percentage).main}</p>
          {getMotivationalMessage(combined.percentage).sub && (
            <p className="text-xs text-rose-400 mt-0.5">{getMotivationalMessage(combined.percentage).sub}</p>
          )}
        </div>

        {/* 개인별 미니 카드 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-orange-50 rounded-xl p-3 flex flex-col gap-2">
            <span className="text-xs font-medium text-gray-500 truncate">{ownerName}</span>
            <span className="text-2xl font-bold text-orange-500">{myStats.percentage}%</span>
            <ProgressBar percentage={myStats.percentage} label="" color="#f97316" size="sm" />
            <span className="text-[11px] text-gray-400">{myStats.completed}/{myStats.total} 완료</span>
          </div>
          <div className="bg-rose-50 rounded-xl p-3 flex flex-col gap-2">
            <span className="text-xs font-medium text-gray-500 truncate">{partnerName ?? '파트너'}</span>
            <span className="text-2xl font-bold text-rose-400">{partnerStats.percentage}%</span>
            <ProgressBar percentage={partnerStats.percentage} label="" color="#ec4899" size="sm" />
            <span className="text-[11px] text-gray-400">{partnerStats.completed}/{partnerStats.total} 완료</span>
          </div>
        </div>

        {/* 카테고리별 — 합산 */}
        <CategorySection todos={allTodos} label="카테고리별 (합산)" />
      </div>
    )
  }

  // ─── 내 할일 / 상대방 할일 탭: 개인 뷰 ──────────────────────────
  const overall = calcOverallProgress(todos)

  if (todos.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-orange-100 text-center">
        <div className="text-3xl mb-2">📋</div>
        <p className="text-sm text-gray-400">{ownerName}님의 할일이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-orange-100 flex flex-col gap-5">
      <div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-semibold text-gray-700">전체 진행률</span>
          <span className="text-sm text-gray-400">{overall.completed}/{overall.total} 완료</span>
        </div>
        <ProgressBar percentage={overall.percentage} label="" color="#f97316" size="lg" />
        <div className="text-center mt-2">
          <p className="text-xs text-gray-400">{getMotivationalMessage(overall.percentage).main}</p>
          {getMotivationalMessage(overall.percentage).sub && (
            <p className="text-xs text-rose-400 mt-0.5">{getMotivationalMessage(overall.percentage).sub}</p>
          )}
        </div>
      </div>
      <CategorySection todos={todos} label="카테고리별" />
    </div>
  )
}
