import type { Todo } from '../types'

export interface ProgressStat {
  completed: number
  total: number
  percentage: number
}

export function calcOverallProgress(todos: Todo[]): ProgressStat {
  const total = todos.length
  const completed = todos.filter((t) => t.isCompleted).length
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { completed, total, percentage }
}

export interface CategoryProgress {
  업무: ProgressStat
  개인: ProgressStat
  공부: ProgressStat
}

export function calcCategoryProgress(todos: Todo[]): CategoryProgress {
  const categories = ['업무', '개인', '공부'] as const
  const result = {} as CategoryProgress

  for (const cat of categories) {
    const catTodos = todos.filter((t) => t.category === cat)
    result[cat] = calcOverallProgress(catTodos)
  }

  return result
}
