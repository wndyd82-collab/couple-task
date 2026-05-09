import type { Todo } from '../types'
import { CATEGORIES } from './categoryConfig'

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

export type CategoryProgress = Record<(typeof CATEGORIES)[number], ProgressStat>

export function calcCategoryProgress(todos: Todo[]): CategoryProgress {
  const result = {} as CategoryProgress
  for (const cat of CATEGORIES) {
    const catTodos = todos.filter((t) => t.category === cat)
    result[cat] = calcOverallProgress(catTodos)
  }
  return result
}

export function calcCombinedProgress(myTodos: Todo[], partnerTodos: Todo[]): ProgressStat {
  return calcOverallProgress([...myTodos, ...partnerTodos])
}
