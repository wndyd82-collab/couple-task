import { useState, type FormEvent, useEffect } from 'react'
import type { Todo } from '../types'
import Button from './Button'
import { CATEGORIES, CATEGORY_CONFIG } from '../lib/categoryConfig'

interface TodoFormProps {
  initialData?: Pick<Todo, 'title' | 'category'>
  onSubmit: (title: string, category: Todo['category']) => Promise<void>
  onCancel: () => void
}

export default function TodoForm({ initialData, onSubmit, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [category, setCategory] = useState<Todo['category'] | ''>(initialData?.category ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!initialData
  const MAX = 100

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setCategory(initialData.category)
    }
  }, [initialData])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('할일 제목을 입력해주세요.')
      return
    }
    if (!category) {
      setError('카테고리를 선택해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(title.trim(), category)
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex flex-col gap-3"
    >
      {/* 제목 입력 */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">할일</label>
          <span className={`text-xs ${title.length >= MAX ? 'text-red-500' : 'text-gray-400'}`}>
            {title.length}/{MAX}
          </span>
        </div>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, MAX))}
          placeholder="어떤 할일을 추가할까요?"
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-orange-200 bg-white text-sm
            outline-none resize-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100
            transition-all"
          autoFocus
        />
      </div>

      {/* 카테고리 선택 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">카테고리</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const cfg = CATEGORY_CONFIG[cat]
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex-1 min-w-[60px] min-h-[44px] py-2 rounded-xl border text-sm font-medium transition-all
                  ${category === cat ? cfg.activeBtn : cfg.idleBtn}`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* 버튼 */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          className="flex-1"
        >
          {isEdit ? '수정하기' : '추가하기'}
        </Button>
      </div>
    </form>
  )
}
