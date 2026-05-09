import { useState } from 'react'
import type { Todo } from '../types'
import { useTodoStore } from '../store/todoStore'
import { useToastStore } from '../store/toastStore'
import TodoItemWithComments from './TodoItemWithComments'
import TodoForm from './TodoForm'
import SkeletonTodo from './SkeletonTodo'

type FilterCategory = '전체' | '업무' | '개인' | '공부'

const FILTERS: FilterCategory[] = ['전체', '업무', '개인', '공부']

const FILTER_ACTIVE: Record<FilterCategory, string> = {
  전체: 'bg-orange-500 text-white border-orange-500',
  업무: 'bg-blue-500 text-white border-blue-500',
  개인: 'bg-green-500 text-white border-green-500',
  공부: 'bg-purple-500 text-white border-purple-500',
}

const EMPTY_ICONS: Record<FilterCategory, string> = {
  전체: '✨', 업무: '💼', 개인: '🌿', 공부: '📚',
}

interface TodoListProps {
  todos: Todo[]
  userId: string
  isReadOnly: boolean
  ownerName?: string
  isLoading?: boolean
}

export default function TodoList({
  todos,
  userId,
  isReadOnly,
  ownerName,
  isLoading = false,
}: TodoListProps) {
  const { activeFilter, setFilter, addTodo, updateTodo } = useTodoStore()
  const { showToast } = useToastStore()

  const [showForm, setShowForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  const filtered = activeFilter === '전체'
    ? todos
    : todos.filter((t) => t.category === activeFilter)

  const handleAdd = async (title: string, category: Todo['category']) => {
    try {
      await addTodo(userId, title, category)
      setShowForm(false)
      showToast('할일을 추가했습니다 ✅')
    } catch {
      showToast('할일 추가에 실패했습니다', 'error')
    }
  }

  const handleEdit = async (title: string, category: Todo['category']) => {
    if (!editingTodo) return
    try {
      await updateTodo(editingTodo.id, { title, category })
      setEditingTodo(null)
      showToast('할일을 수정했습니다 ✏️')
    } catch {
      showToast('수정에 실패했습니다', 'error')
    }
  }

  const handleStartEdit = (todo: Todo) => {
    setShowForm(false)
    setEditingTodo(todo)
  }

  const handleOpenAdd = () => {
    setEditingTodo(null)
    setShowForm(true)
  }

  const showSkeleton = isLoading && todos.length === 0

  return (
    <div className="flex flex-col gap-3">
      {/* 카테고리 필터 탭 */}
      <div
        role="tablist"
        aria-label="카테고리 필터"
        className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide"
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={activeFilter === f}
            onClick={() => setFilter(f)}
            className={`min-h-[36px] px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
              transition-all border focus:outline-none focus:ring-2 focus:ring-orange-300
              ${activeFilter === f
                ? FILTER_ACTIVE[f]
                : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'
              }`}
          >
            {f}
            <span className="ml-1.5 text-xs opacity-70">
              {f === '전체' ? todos.length : todos.filter((t) => t.category === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* 인라인 추가 폼 */}
      {!isReadOnly && showForm && (
        <TodoForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      {/* 인라인 추가 버튼 — 데스크톱 전용 (sm 이상) */}
      {!isReadOnly && !showForm && !editingTodo && (
        <button
          onClick={handleOpenAdd}
          aria-label="새 할일 추가"
          className="hidden sm:flex items-center gap-2 w-full min-h-[44px] px-4 py-3 rounded-xl
            border-2 border-dashed border-orange-200 text-orange-400 text-sm font-medium
            hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all
            focus:outline-none focus:ring-2 focus:ring-orange-300"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          할일 추가
        </button>
      )}

      {/* 스켈레톤 로딩 */}
      {showSkeleton ? (
        <div className="flex flex-col gap-2" aria-label="할일 불러오는 중">
          {[1, 2, 3].map((i) => <SkeletonTodo key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        /* 빈 상태 */
        <div
          role="tabpanel"
          className="flex flex-col items-center justify-center py-14 gap-3 text-center"
        >
          {todos.length === 0 ? (
            // 할일 자체가 없는 경우
            <>
              <span className="text-5xl" aria-hidden="true">
                {isReadOnly ? '🤗' : '✨'}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {isReadOnly
                    ? `${ownerName ?? '파트너'}님의 할일이 아직 없어요`
                    : '아직 할일이 없어요'}
                </p>
                {!isReadOnly && (
                  <p className="text-xs text-gray-400 mt-1">
                    첫 번째 할일을 추가해보세요! 💪
                  </p>
                )}
              </div>
            </>
          ) : (
            // 필터 결과 없음
            <>
              <span className="text-4xl" aria-hidden="true">{EMPTY_ICONS[activeFilter]}</span>
              <p className="text-sm text-gray-400">
                {activeFilter} 카테고리에 할일이 없습니다.
              </p>
            </>
          )}
        </div>
      ) : (
        /* 할일 목록 */
        <div className="flex flex-col gap-2" role="tabpanel">
          {filtered.map((todo) =>
            editingTodo?.id === todo.id ? (
              <TodoForm
                key={todo.id}
                initialData={{ title: todo.title, category: todo.category }}
                onSubmit={handleEdit}
                onCancel={() => setEditingTodo(null)}
              />
            ) : (
              <TodoItemWithComments
                key={todo.id}
                todo={todo}
                isReadOnly={isReadOnly}
                onEdit={handleStartEdit}
              />
            )
          )}
        </div>
      )}

      {/* FAB — 모바일 전용 (sm 미만), 추가 폼이 열려있지 않을 때 */}
      {!isReadOnly && !showForm && !editingTodo && (
        <button
          onClick={handleOpenAdd}
          aria-label="할일 추가"
          className="fixed bottom-6 right-4 sm:hidden z-30
            w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95
            text-white shadow-2xl flex items-center justify-center transition-all"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  )
}
