import { useState } from 'react'
import type { Todo } from '../types'
import TodoItem from './TodoItem'
import CommentSection from './CommentSection'

interface TodoItemWithCommentsProps {
  todo: Todo
  isReadOnly: boolean
  onEdit: (todo: Todo) => void
}

export default function TodoItemWithComments({ todo, isReadOnly, onEdit }: TodoItemWithCommentsProps) {
  const [commentOpen, setCommentOpen] = useState(false)

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100
        hover:shadow-md hover:border-orange-100 transition-all duration-200 overflow-hidden
        ${todo.isCompleted ? 'opacity-60' : ''}`}
    >
      {/* standalone=false: 외부 카드 컨테이너는 여기서 담당 */}
      <TodoItem
        todo={todo}
        isReadOnly={isReadOnly}
        onEdit={onEdit}
        standalone={false}
      />
      <CommentSection
        todoId={todo.id}
        isOpen={commentOpen}
        onToggle={() => setCommentOpen((prev) => !prev)}
      />
    </div>
  )
}
