import { useState } from 'react'
import type { Todo } from '../types'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

interface CalendarViewProps {
  myTodos: Todo[]
  partnerTodos: Todo[]
  onSelectDate: (date: string) => void
  selectedDate: string | null
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function CalendarView({ myTodos, partnerTodos, onSelectDate, selectedDate }: CalendarViewProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())

  const myDates = new Set(myTodos.map((t) => t.dueDate).filter(Boolean))
  const partnerDates = new Set(partnerTodos.map((t) => t.dueDate).filter(Boolean))

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
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="이전 달"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-base font-semibold text-gray-800">
          {viewYear}년 {viewMonth + 1}월
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="다음 달"
        >
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
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="aspect-square" />

          const dateStr = toDateStr(viewYear, viewMonth, day)
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const hasMyTodo = myDates.has(dateStr)
          const hasPartnerTodo = partnerDates.has(dateStr)
          const col = idx % 7

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`aspect-square flex flex-col items-center justify-center gap-0.5 transition-all
                hover:bg-orange-50 focus:outline-none focus:bg-orange-50
                ${isSelected ? 'bg-orange-100' : ''}`}
            >
              <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
                ${isToday ? 'bg-orange-500 text-white' : ''}
                ${isSelected && !isToday ? 'ring-2 ring-orange-400' : ''}
                ${!isToday && col === 0 ? 'text-red-400' : ''}
                ${!isToday && col === 6 ? 'text-blue-400' : ''}
                ${!isToday && col !== 0 && col !== 6 ? 'text-gray-700' : ''}`}
              >
                {day}
              </span>
              {/* 할일 점 표시 */}
              <div className="flex gap-0.5">
                {hasMyTodo && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                {hasPartnerTodo && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* 범례 */}
      <div className="flex gap-4 px-5 py-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-orange-400" />내 할일
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-rose-400" />파트너 할일
        </div>
      </div>
    </div>
  )
}
