import { useState } from 'react'
import type { Todo } from '../types'
import { useTodoStore } from '../store/todoStore'
import { useToastStore } from '../store/toastStore'
import TodoItemWithComments from './TodoItemWithComments'
import TodoForm from './TodoForm'

interface DayDetailPanelProps {
  date: string
  myTodos: Todo[]
  partnerTodos: Todo[]
  userId: string
  partnerName?: string
  onClose: () => void
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${year}년 ${Number(month)}월 ${Number(day)}일`
}

export default function DayDetailPanel({ date, myTodos, partnerTodos, userId, partnerName, onClose }: DayDetailPanelProps) {
  const { addTodo } = useTodoStore()
  const { showToast } = useToastStore()
  const [showForm, setShowForm] = useState(false)

  const dayMyTodos = myTodos.filter((t) => t.dueDate === date)
  const dayPartnerTodos = partnerTodos.filter((t) => t.dueDate === date)

  const handleAdd = async (title: string, category: Todo['category']) => {
    try {
      await addTodo(userId, title, category, date)
      setShowForm(false)
      showToast('할일을 추가했습니다 ✅')
    } catch {
      showToast('할일 추가에 실패했습니다', 'error')
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      {/* 배경 딤 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* 패널 */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl
        max-h-[85vh] flex flex-col animate-slide-up">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-800">{formatDate(date)}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              총 {dayMyTodos.length + dayPartnerTodos.length}개 할일
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="닫기"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">
          {/* 추가 폼 */}
          {showForm && (
            <TodoForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
          )}

          {/* 내 할일 */}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">내 할일</p>
            {dayMyTodos.length === 0 ? (
              <p className="text-sm text-gray-300 py-2">이 날 할일이 없어요</p>
            ) : (
              <div className="flex flex-col gap-2">
                {dayMyTodos.map((todo) => (
                  <TodoItemWithComments key={todo.id} todo={todo} isReadOnly={false} onEdit={() => {}} />
                ))}
              </div>
            )}
          </div>

          {/* 파트너 할일 */}
          {dayPartnerTodos.length > 0 && (
            <div>
              <p className="text-xs font-medium text-rose-400 mb-2">{partnerName ?? '파트너'} 할일</p>
              <div className="flex flex-col gap-2">
                {dayPartnerTodos.map((todo) => (
                  <TodoItemWithComments key={todo.id} todo={todo} isReadOnly={true} onEdit={() => {}} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 하단 추가 버튼 */}
        {!showForm && (
          <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
            <button
              onClick={() => setShowForm(true)}
              className="w-full min-h-[44px] rounded-xl bg-orange-500 hover:bg-orange-600
                text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              이 날 할일 추가
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
