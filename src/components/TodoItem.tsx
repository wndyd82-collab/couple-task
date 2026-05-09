import { useState } from 'react'
import type { Todo } from '../types'
import { useTodoStore } from '../store/todoStore'
import { useToastStore } from '../store/toastStore'
import { CATEGORY_CONFIG } from '../lib/categoryConfig'

interface TodoItemProps {
  todo: Todo
  isReadOnly: boolean
  onEdit: (todo: Todo) => void
  standalone?: boolean
}

export default function TodoItem({ todo, isReadOnly, onEdit, standalone = true }: TodoItemProps) {
  const { toggleComplete, deleteTodo } = useTodoStore()
  const { showToast } = useToastStore()
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)

  const handleToggle = async () => {
    if (isReadOnly || toggling) return
    setToggling(true)
    try {
      await toggleComplete(todo.id, todo.isCompleted)
      showToast(todo.isCompleted ? '미완료로 변경했습니다' : '완료! 🎉')
    } catch {
      showToast('변경에 실패했습니다', 'error')
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`"${todo.title}" 할일을 삭제할까요?`)) return
    setDeleting(true)
    try {
      await deleteTodo(todo.id)
      showToast('할일을 삭제했습니다 🗑️')
    } catch {
      showToast('삭제에 실패했습니다', 'error')
    } finally {
      setDeleting(false)
    }
  }

  // group 클래스를 내부 div에 배치 → standalone 여부와 무관하게 group-hover 동작
  const inner = (
    <div className={`group flex items-start gap-3 p-4 ${todo.isCompleted && !standalone ? 'opacity-60' : ''}`}>
      {/* 체크박스 */}
      <button
        onClick={handleToggle}
        disabled={isReadOnly || toggling}
        className={`mt-0.5 w-5 h-5 min-w-[20px] rounded-full border-2 flex items-center justify-center
          transition-all duration-200 flex-shrink-0
          focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-1
          ${todo.isCompleted
            ? 'bg-orange-500 border-orange-500'
            : 'border-gray-300 hover:border-orange-400'
          }
          ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
        aria-label={todo.isCompleted ? `${todo.title} 완료 취소` : `${todo.title} 완료 체크`}
        aria-pressed={todo.isCompleted}
      >
        {(todo.isCompleted || toggling) && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-relaxed break-words
          ${todo.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}
        >
          {todo.title}
        </p>
        <span
          className={`inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full border
            ${(CATEGORY_CONFIG[todo.category] ?? CATEGORY_CONFIG['기타']).chipStyle}`}
          aria-label={`카테고리: ${todo.category}`}
        >
          {todo.category}
        </span>
      </div>

      {/* 액션 버튼 — 내 할일만 노출 */}
      {!isReadOnly && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onEdit(todo)}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg
              text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all
              focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label={`${todo.title} 수정`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg
              text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all
              focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label={`${todo.title} 삭제`}
          >
            {deleting ? (
              <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  )

  if (standalone) {
    return (
      <div className={`bg-white rounded-xl border border-gray-100
        hover:shadow-md hover:border-orange-100 transition-all duration-200 overflow-hidden
        ${todo.isCompleted ? 'opacity-60' : ''}`}
      >
        {inner}
      </div>
    )
  }

  return inner
}
