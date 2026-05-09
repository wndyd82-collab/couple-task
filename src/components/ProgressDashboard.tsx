import type { Todo } from '../types'
import { calcOverallProgress, calcCategoryProgress } from '../lib/progressUtils'
import ProgressBar from './ProgressBar'

const CATEGORY_COLORS = {
  업무: '#3b82f6',  // blue-500
  개인: '#22c55e',  // green-500
  공부: '#a855f7',  // purple-500
} as const

interface ProgressDashboardProps {
  todos: Todo[]
  ownerName: string
}

export default function ProgressDashboard({ todos, ownerName }: ProgressDashboardProps) {
  const overall = calcOverallProgress(todos)
  const byCategory = calcCategoryProgress(todos)

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
      {/* 전체 진행률 */}
      <div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-semibold text-gray-700">전체 진행률</span>
          <span className="text-sm text-gray-400">
            {overall.completed}/{overall.total} 완료
          </span>
        </div>
        <ProgressBar
          percentage={overall.percentage}
          label=""
          color="#f97316"
          size="lg"
        />
      </div>

      {/* 카테고리별 */}
      <div className="border-t border-gray-50 pt-4 flex flex-col gap-3">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">카테고리별</span>
        {(Object.entries(byCategory) as [keyof typeof CATEGORY_COLORS, (typeof byCategory)[keyof typeof byCategory]][]).map(
          ([cat, stat]) => (
            <ProgressBar
              key={cat}
              percentage={stat.percentage}
              label={cat}
              color={CATEGORY_COLORS[cat]}
              completed={stat.completed}
              total={stat.total}
              size="sm"
            />
          )
        )}
      </div>
    </div>
  )
}
