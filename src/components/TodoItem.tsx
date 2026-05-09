import { useState } from 'react'
import type { Todo, Assignee } from '../types'
import { useTodoStore } from '../store/todoStore'
import { useToastStore } from '../store/toastStore'
import { useAuthStore } from '../store/authStore'
import { CATEGORY_CONFIG } from '../lib/categoryConfig'
import { dDay, formatDueDate, getDDayLabel } from '../lib/dateUtils'

// 담당자 아바타 배지
function AssigneeBadge({ assignee, partnerName }: { assignee?: Assignee | null; partnerName?: string }) {
  if (!assignee) return null
  const initial = partnerName ? partnerName[0].toUpperCase() : '상'

  if (assignee === 'me') {
    return (
      <span
        className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full
          bg-blue-100 text-blue-600 text-[10px] font-bold"
        title="나"
      >
        나
      </span>
    )
  }

  if (assignee === 'partner') {
    return (
      <span
        className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full
          bg-rose-100 text-rose-600 text-[10px] font-bold"
        title={partnerName ?? '상대방'}
      >
        {initial}
      </span>
    )
  }

  // 'both' — 파란 원 + 분홍 원 겹치기
  return (
    <span className="flex-shrink-0 relative inline-block w-9 h-6" title="함께">
      <span className="absolute left-0 top-0 inline-flex items-center justify-center w-6 h-6 rounded-full
        bg-blue-100 text-blue-600 text-[9px] font-bold border-2 border-white z-10">
        나
      </span>
      <span className="absolute left-3 top-0 inline-flex items-center justify-center w-6 h-6 rounded-full
        bg-rose-100 text-rose-600 text-[9px] font-bold border-2 border-white">
        {initial}
      </span>
    </span>
  )
}

// 마감일 + D-Day 배지
function DueDateBadge({ dueDate }: { dueDate?: string | null }) {
  if (!dueDate) return null

  const diff = dDay(dueDate)
  const isPast = diff < 0

  const colorClass =
    isPast        ? 'text-red-500' :
    diff === 0    ? 'text-red-600 font-semibold' :
    diff <= 3     ? 'text-red-500' :
    diff <= 7     ? 'text-orange-500' :
                    'text-gray-400'

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs ${colorClass}`}>
      <span aria-hidden="true">📅</span>
      <span>{formatDueDate(dueDate)}</span>
      <span aria-hidden="true">·</span>
      <span className={isPast ? 'line-through' : ''}>{getDDayLabel(dueDate)}</span>
    </span>
  )
}

interface TodoItemProps {
  todo: Todo
  isReadOnly: boolean
  onEdit: (todo: Todo) => void
  standalone?: boolean
  partnerName?: string
}

export default function TodoItem({ todo, isReadOnly, onEdit, standalone = true, partnerName }: TodoItemProps) {
  const { toggleComplete, deleteTodo, sendThankYou } = useTodoStore()
  const { showToast } = useToastStore()
  const { currentUser } = useAuthStore()
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [thanking, setThanking] = useState(false)

  const alreadyThanked = !!todo.thankYou

  const handleThankYou = async () => {
    if (!currentUser || alreadyThanked || thanking) return
    setThanking(true)
    try {
      await sendThankYou(todo.id, currentUser.uid)
      showToast('감사한 마음을 전달했어요 💛')
    } catch {
      showToast('전송에 실패했습니다', 'error')
    } finally {
      setThanking(false)
    }
  }

  const handleToggle = async () => {
    if (isReadOnly || toggling) return
    setToggling(true)
    try {
      await toggleComplete(todo.id, todo.isCompleted)
      showToast(todo.isCompleted ? '미완료로 되돌렸어요' : '완료! 수고했어요 💪')
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
      showToast('할일을 삭제했어요')
    } catch {
      showToast('삭제에 실패했습니다', 'error')
    } finally {
      setDeleting(false)
    }
  }

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
        {/* 제목 행: 텍스트 + 담당자 아바타 */}
        <div className="flex items-start gap-2">
          <p className={`flex-1 text-sm leading-relaxed break-words
            ${todo.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}
          >
            {todo.title}
          </p>
          <AssigneeBadge assignee={todo.assignee} partnerName={partnerName} />
        </div>

        {/* 하단 행: 카테고리 + 마감일·D-Day */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span
            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border
              ${(CATEGORY_CONFIG[todo.category] ?? CATEGORY_CONFIG['기타']).chipStyle}`}
            aria-label={`카테고리: ${todo.category}`}
          >
            {todo.category}
          </span>
          <DueDateBadge dueDate={todo.dueDate} />
        </div>

        {/* 고마워요 버튼 — 파트너 완료 할일에만 표시 */}
        {isReadOnly && todo.isCompleted && (
          <button
            onClick={handleThankYou}
            disabled={alreadyThanked || thanking}
            className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
              transition-all border
              ${alreadyThanked
                ? 'bg-amber-50 text-amber-400 border-amber-200 cursor-default'
                : 'bg-white text-amber-600 border-amber-300 hover:bg-amber-50 hover:border-amber-400 active:scale-95'
              }`}
            aria-label={alreadyThanked ? '이미 고마워했어요' : '고마워요 전달'}
          >
            {thanking ? (
              <span className="w-3 h-3 border-2 border-amber-300 border-t-amber-500 rounded-full animate-spin" />
            ) : (
              <span aria-hidden="true">💛</span>
            )}
            {alreadyThanked ? '고마워했어요' : '고마워요'}
          </button>
        )}
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
