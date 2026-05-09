import { useEffect, useState, useMemo } from 'react'
import { useAuthStore } from '../store/authStore'
import { useTodoStore } from '../store/todoStore'
import { useCommentStore } from '../store/commentStore'
import ProgressDashboard from '../components/ProgressDashboard'
import TodoList from '../components/TodoList'
import Header from '../components/Header'
import InvitePanel from '../components/InvitePanel'

type Tab = 'my' | 'partner' | 'invite'

export default function DashboardPage() {
  const { currentUser, partner } = useAuthStore()
  const { myTodos, partnerTodos, isLoading: todoIsLoading, subscribeMyTodos, subscribePartnerTodos } = useTodoStore()
  const { commentsByTodoId, subscribeComments, unsubscribeAll } = useCommentStore()

  const [activeTab, setActiveTab] = useState<Tab>('my')
  const [lastSeenPartnerCommentCount, setLastSeenPartnerCommentCount] = useState(0)

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

  // 내 탭에 있을 때만 뱃지 표시
  const newCommentBadge = activeTab === 'my'
    ? Math.max(0, partnerCommentCount - lastSeenPartnerCommentCount)
    : 0

  if (!currentUser) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
      <Header />

      {/* 탭 */}
      <div className="bg-white border-b border-orange-100">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab('my')}
              className={`min-h-[44px] px-5 py-3 text-sm font-medium border-b-2 transition-all
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

            {partner ? (
              <button
                onClick={handlePartnerTabClick}
                className={`relative min-h-[44px] px-5 py-3 text-sm font-medium border-b-2 transition-all
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
                {newCommentBadge > 0 && (
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
                className={`min-h-[44px] px-5 py-3 text-sm font-medium border-b-2 transition-all
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
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 sm:pb-6 flex flex-col gap-5">
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
    </div>
  )
}
