import { useState } from 'react'
import type { Todo } from '../types'
import { getHoliday } from '../lib/holidays'
import { CATEGORY_CONFIG } from '../lib/categoryConfig'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

interface CalendarViewProps {
  myTodos: Todo[]
  partnerTodos: Todo[]
  partnerName?: string
  onSelectDate: (date: string) => void
  selectedDate: string | null
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const MAX_VISIBLE = 2

export default function CalendarView({ myTodos, partnerTodos, partnerName, onSelectDate, selectedDate }: CalendarViewProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())

  // 날짜별 할일 맵
  const todosByDate = new Map<string, { todo: Todo; isPartner: boolean }[]>()
  const allTodos = [
    ...myTodos.map((t) => ({ todo: t, isPartner: false })),
    ...partnerTodos.map((t) => ({ todo: t, isPartner: true })),
  ]
  for (const item of allTodos) {
    if (!item.todo.dueDate) continue
    if (!todosByDate.has(item.todo.dueDate)) todosByDate.set(item.todo.dueDate, [])
    todosByDate.get(item.todo.dueDate)!.push(item)
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors" aria-label="이전 달">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()) }}
          className="text-base font-semibold text-gray-800 hover:text-orange-500 transition-colors">
          {viewYear}년 {viewMonth + 1}월
        </button>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors" aria-label="다음 달">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {WEEKDAYS.map((d, i) => (
          <div key={d} className={`py-2 text-center text-xs font-medium
            ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="min-h-[80px] bg-gray-50/50" />

          const dateStr = toDateStr(viewYear, viewMonth, day)
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const col = idx % 7
          const items = todosByDate.get(dateStr) ?? []
          const visible = items.slice(0, MAX_VISIBLE)
          const overflow = items.length - MAX_VISIBLE
          const holiday = getHoliday(dateStr)
          const isRed = col === 0 || !!holiday

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`min-h-[80px] p-1 flex flex-col items-stretch text-left transition-colors
                hover:bg-orange-50 focus:outline-none
                ${isSelected ? 'bg-orange-50 ring-1 ring-inset ring-orange-300' : ''}`}
            >
              {/* 날짜 숫자 */}
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-0.5 self-center
                ${isToday ? 'bg-orange-500 text-white' : ''}
                ${!isToday && isRed ? 'text-red-400' : ''}
                ${!isToday && col === 6 && !holiday ? 'text-blue-400' : ''}
                ${!isToday && !isRed && col !== 6 ? 'text-gray-700' : ''}`}
              >
                {day}
              </span>
              {/* 공휴일 이름 */}
              {holiday && (
                <span className="text-[9px] text-red-400 leading-tight text-center truncate px-0.5 mb-0.5">
                  {holiday}
                </span>
              )}

              {/* 할일 목록 */}
              <div className="flex flex-col gap-0.5 w-full">
                {visible.map(({ todo, isPartner }) => (
                  <div
                    key={todo.id}
                    className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate
                      ${isPartner
                        ? 'bg-rose-100 text-rose-700'
                        : (CATEGORY_CONFIG[todo.category] ?? CATEGORY_CONFIG['기타']).color
                      }
                      ${todo.isCompleted ? 'line-through opacity-50' : ''}`}
                  >
                    {todo.title}
                  </div>
                ))}
                {overflow > 0 && (
                  <div className="text-[10px] text-gray-400 px-1">+{overflow}개 더</div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-3 px-4 py-3 border-t border-gray-100">
        {(Object.entries(CATEGORY_CONFIG) as [keyof typeof CATEGORY_CONFIG, typeof CATEGORY_CONFIG[keyof typeof CATEGORY_CONFIG]][]).map(([cat, cfg]) => (
          <div key={cat} className="flex items-center gap-1 text-[11px] text-gray-400">
            <span className={`w-2.5 h-2.5 rounded-sm ${cfg.color}`} />
            {cat}
          </div>
        ))}
        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-100 border border-rose-200" />{partnerName ?? '파트너'}
        </div>
      </div>
    </div>
  )
}
