import { useEffect, useState, useMemo } from 'react'
import { useAuthStore } from '../store/authStore'
import { useTodoStore } from '../store/todoStore'
import { useCommentStore } from '../store/commentStore'
import ProgressDashboard from '../components/ProgressDashboard'
import TodoList from '../components/TodoList'
import SharedTodoList from '../components/SharedTodoList'
import Header from '../components/Header'
import InvitePanel from '../components/InvitePanel'
import CalendarView from '../components/CalendarView'
import DayDetailPanel from '../components/DayDetailPanel'
import Footer from '../components/Footer'

type Tab = 'shared' | 'calendar' | 'my' | 'partner' | 'invite'

export default function DashboardPage() {
  const { currentUser, partner } = useAuthStore()
  const { myTodos, partnerTodos, isLoading: todoIsLoading, subscribeMyTodos, subscribePartnerTodos } = useTodoStore()
  const { commentsByTodoId, subscribeComments, unsubscribeAll } = useCommentStore()

  const [activeTab, setActiveTab] = useState<Tab>('shared')
  const [lastSeenPartnerCommentCount, setLastSeenPartnerCommentCount] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // 할일 구독
  useEffect(() => {
    if (!currentUser) return
    const unsubMy = subscribeMyTodos(currentUser.uid)
    const unsubPartner = partner ? subscribePartnerTodos(partner.uid) : undefined
    return () => {
      unsubMy()
      unsubPartner?.()
    }
  }, [currentUser, partner, subscribeMyTodos, subscribePartnerTodos])

  // 모든 할일의 댓글 구독 (내 할일 + 파트너 할일 통합)
  const allTodoIdStr = useMemo(
    () => [...myTodos, ...partnerTodos].map((t) => t.id).join(','),
    [myTodos, partnerTodos],
  )

  useEffect(() => {
    const ids = allTodoIdStr ? allTodoIdStr.split(',') : []
    if (ids.length > 0) subscribeComments(ids)
  }, [allTodoIdStr, subscribeComments])

  // 언마운트 시 구독 해제
  useEffect(() => () => unsubscribeAll(), [unsubscribeAll])

  // 파트너 할일의 총 댓글 수
  const partnerCommentCount = useMemo(
    () => partnerTodos.reduce((sum, t) => sum + (commentsByTodoId[t.id]?.length ?? 0), 0),
    [partnerTodos, commentsByTodoId],
  )

  // 파트너 탭 클릭: 탭 전환 + 읽음 처리
  const handlePartnerTabClick = () => {
    setActiveTab('partner')
    setLastSeenPartnerCommentCount(partnerCommentCount)
  }

  // 내 할일 탭 또는 우리 할일 탭에 있을 때 뱃지 표시
  const newCommentBadge = (activeTab === 'my' || activeTab === 'shared')
    ? Math.max(0, partnerCommentCount - lastSeenPartnerCommentCount)
    : 0

  if (!currentUser) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex flex-col">
      <Header />

      {/* 탭 */}
      <div className="bg-white border-b border-orange-100">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {/* 우리 할일 (기본 탭) */}
            <button
              onClick={() => setActiveTab('shared')}
              className={`relative min-h-[44px] flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all
                ${activeTab === 'shared'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              우리 할일
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                ${activeTab === 'shared' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                {myTodos.length + partnerTodos.length}
              </span>
              {newCommentBadge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                  bg-rose-500 text-white text-[10px] font-bold rounded-full
                  flex items-center justify-center animate-pulse">
                  {newCommentBadge > 99 ? '99+' : newCommentBadge}
                </span>
              )}
            </button>

            {/* 달력 */}
            <button
              onClick={() => setActiveTab('calendar')}
              className={`min-h-[44px] flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all
                ${activeTab === 'calendar'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              📅 달력
            </button>

            {/* 내 할일 */}
            <button
              onClick={() => setActiveTab('my')}
              className={`min-h-[44px] flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all
                ${activeTab === 'my'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              내 할일
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                ${activeTab === 'my' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                {myTodos.length}
              </span>
            </button>

            {/* 상대방 할일 / 파트너 초대 */}
            {partner ? (
              <button
                onClick={handlePartnerTabClick}
                className={`relative min-h-[44px] flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all
                  ${activeTab === 'partner'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {partner.displayName}의 할일
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                  ${activeTab === 'partner' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                  {partnerTodos.length}
                </span>
                {newCommentBadge > 0 && activeTab !== 'shared' && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                    bg-rose-500 text-white text-[10px] font-bold rounded-full
                    flex items-center justify-center animate-pulse">
                    {newCommentBadge > 99 ? '99+' : newCommentBadge}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('invite')}
                className={`min-h-[44px] flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all
                  ${activeTab === 'invite'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                💌 파트너 초대
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      {selectedDate && (
        <DayDetailPanel
          date={selectedDate}
          myTodos={myTodos}
          partnerTodos={partnerTodos}
          userId={currentUser.uid}
          partnerName={partner?.displayName}
          onClose={() => setSelectedDate(null)}
        />
      )}

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 sm:pb-6 flex flex-col gap-5">
        {activeTab === 'shared' && (
          <SharedTodoList
            myTodos={myTodos}
            partnerTodos={partnerTodos}
            myUserId={currentUser.uid}
            partnerName={partner?.displayName}
            isLoading={todoIsLoading}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarView
            myTodos={myTodos}
            partnerTodos={partnerTodos}
            partnerName={partner?.displayName}
            onSelectDate={setSelectedDate}
            selectedDate={selectedDate}
          />
        )}
        {activeTab === 'my' && (
          <>
            <ProgressDashboard todos={myTodos} ownerName={currentUser.displayName} />
            <TodoList
              todos={myTodos}
              userId={currentUser.uid}
              isReadOnly={false}
              isLoading={todoIsLoading}
            />
          </>
        )}
        {activeTab === 'partner' && partner && (
          <>
            <ProgressDashboard todos={partnerTodos} ownerName={partner.displayName} />
            <TodoList
              todos={partnerTodos}
              userId={partner.uid}
              isReadOnly={true}
              ownerName={partner.displayName}
              isLoading={todoIsLoading}
            />
          </>
        )}
        {activeTab === 'invite' && !partner && (
          <InvitePanel />
        )}
      </main>
      <Footer />
    </div>
  )
}
