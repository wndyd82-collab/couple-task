import { useState, useMemo } from 'react'
import type { Todo, Assignee } from '../types'
import { useTodoStore } from '../store/todoStore'
import { useToastStore } from '../store/toastStore'
import TodoItemWithComments from './TodoItemWithComments'
import TodoForm from './TodoForm'
import SkeletonTodo from './SkeletonTodo'

const ASSIGNEE_LABELS: Record<Assignee, string> = {
  me: '나',
  partner: '상대방',
  both: '함께',
}

interface CombinedItem {
  todo: Todo
  isOwn: boolean
}

function sortCombined(items: CombinedItem[]): CombinedItem[] {
  return [...items].sort((a, b) => {
    // 1. 미완료 먼저
    if (a.todo.isCompleted !== b.todo.isCompleted) {
      return a.todo.isCompleted ? 1 : -1
    }
    // 2. 마감일 빠른 순 (없으면 뒤로)
    const da = a.todo.dueDate
    const db = b.todo.dueDate
    if (da && db) return da.localeCompare(db)
    if (da) return -1
    if (db) return 1
    // 3. 최신 등록 순
    const ca = a.todo.createdAt?.toMillis?.() ?? 0
    const cb = b.todo.createdAt?.toMillis?.() ?? 0
    return cb - ca
  })
}

interface SharedTodoListProps {
  myTodos: Todo[]
  partnerTodos: Todo[]
  myUserId: string
  partnerName?: string
  isLoading?: boolean
}

export default function SharedTodoList({
  myTodos,
  partnerTodos,
  partnerName,
  isLoading = false,
}: SharedTodoListProps) {
  const { updateTodo } = useTodoStore()
  const { showToast } = useToastStore()
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  const combined = useMemo<CombinedItem[]>(() => {
    const my = myTodos.map((t) => ({ todo: t, isOwn: true }))
    const partner = partnerTodos.map((t) => ({ todo: t, isOwn: false }))
    return sortCombined([...my, ...partner])
  }, [myTodos, partnerTodos])

  const handleEdit = async (
    title: string,
    category: Todo['category'],
    assignee: Assignee | null,
    dueDate: string | null,
  ) => {
    if (!editingTodo) return
    try {
      await updateTodo(editingTodo.id, { title, category, assignee, dueDate })
      setEditingTodo(null)
      showToast('할일을 수정했어요 ✏️')
    } catch {
      showToast('수정에 실패했습니다', 'error')
    }
  }

  const showSkeleton = isLoading && combined.length === 0

  return (
    <div className="flex flex-col gap-4">
      {/* 할일 목록 */}
      <div className="flex flex-col gap-2">
        {showSkeleton ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => <SkeletonTodo key={i} />)}
          </div>
        ) : combined.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
            <span className="text-5xl" aria-hidden="true">💑</span>
            <div>
              <p className="text-sm font-medium text-gray-500">아직 우리의 할일이 없어요 💑</p>
              <p className="text-xs text-gray-400 mt-1">오늘 함께할 일을 추가해보세요</p>
            </div>
          </div>
        ) : (
          combined.map(({ todo, isOwn }) =>
            editingTodo?.id === todo.id ? (
              <TodoForm
                key={todo.id}
                initialData={{
                  title: todo.title,
                  category: todo.category,
                  assignee: todo.assignee,
                  dueDate: todo.dueDate,
                }}
                onSubmit={handleEdit}
                onCancel={() => setEditingTodo(null)}
              />
            ) : (
              <div key={todo.id} className="flex flex-col">
                {/* 소유자 + 담당자 배지 */}
                <div className="flex items-center gap-2 mb-0.5 px-1">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                      ${isOwn ? 'bg-orange-100 text-orange-600' : 'bg-rose-100 text-rose-600'}`}
                  >
                    {isOwn ? '나' : (partnerName ?? '상대방')}
                  </span>
                  {todo.assignee && (
                    <span className="text-[10px] text-gray-400">
                      담당: {ASSIGNEE_LABELS[todo.assignee]}
                    </span>
                  )}
                </div>
                <TodoItemWithComments
                  todo={todo}
                  isReadOnly={!isOwn}
                  onEdit={isOwn ? (t) => setEditingTodo(t) : () => {}}
                  partnerName={partnerName}
                />
              </div>
            )
          )
        )}
      </div>
    </div>
  )
}
