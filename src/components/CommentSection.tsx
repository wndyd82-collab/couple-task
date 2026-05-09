import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { useCommentStore } from '../store/commentStore'
import { useAuthStore } from '../store/authStore'
import { formatRelativeTime } from '../lib/dateUtils'

interface CommentSectionProps {
  todoId: string
  isOpen: boolean
  onToggle: () => void
}

export default function CommentSection({ todoId, isOpen, onToggle }: CommentSectionProps) {
  const { commentsByTodoId, addComment } = useCommentStore()
  const { currentUser } = useAuthStore()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const listEndRef = useRef<HTMLDivElement>(null)

  const comments = commentsByTodoId[todoId] ?? []
  const count = comments.length

  // 댓글 목록 끝으로 스크롤
  useEffect(() => {
    if (isOpen && listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isOpen, count])

  // 모바일: 키보드 올라올 때 입력창이 가려지지 않도록
  const handleFocus = () => {
    setTimeout(() => {
      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 350)
  }

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      await addComment(todoId, content)
      setContent('')
      textareaRef.current?.focus()
    } catch {
      // silently handled
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-gray-100">
      {/* 토글 버튼 */}
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 w-full px-4 py-2.5 text-left
          text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50
          transition-colors"
      >
        <span>💬</span>
        <span>응원 댓글</span>
        {count > 0 && (
          <span className="ml-0.5 bg-orange-100 text-orange-600 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
            {count}
          </span>
        )}
        <svg
          className={`ml-auto w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 어코디언 본체 */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? 'max-h-[420px]' : 'max-h-0'}`}
      >
        <div className="px-4 pb-4 flex flex-col gap-3">
          {/* 댓글 목록 */}
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto overscroll-contain pr-1">
            {count === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">
                첫 번째 응원을 남겨보세요 🎉
              </p>
            ) : (
              <>
                {comments.map((c) => {
                  const isMe = c.authorId === currentUser?.uid
                  return (
                    <div
                      key={c.id}
                      className={`flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed
                          ${isMe
                            ? 'bg-orange-100 text-orange-900 rounded-tr-sm'
                            : 'bg-gray-100 text-gray-700 rounded-tl-sm'
                          }`}
                      >
                        {!isMe && (
                          <p className="font-semibold text-[10px] text-gray-500 mb-0.5">
                            {c.authorName}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap break-words">{c.content}</p>
                      </div>
                      <span className="text-[10px] text-gray-300 px-1">
                        {formatRelativeTime(c.createdAt)}
                      </span>
                    </div>
                  )
                })}
                <div ref={listEndRef} />
              </>
            )}
          </div>

          {/* 입력 영역 */}
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              placeholder="응원 메시지 입력 (Enter 전송, Shift+Enter 줄바꿈)"
              rows={1}
              className="flex-1 px-3 py-2.5 text-xs rounded-xl border border-gray-200 bg-white
                outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-50
                resize-none transition-all leading-relaxed"
            />
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="min-h-[38px] min-w-[50px] px-3 rounded-xl bg-orange-500 text-white
                text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed
                hover:bg-orange-600 active:scale-95 transition-all
                flex items-center justify-center flex-shrink-0"
            >
              {isSubmitting ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                '응원'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
