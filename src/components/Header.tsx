import { useAuthStore } from '../store/authStore'

export default function Header() {
  const { currentUser, partner, signOut } = useAuthStore()

  return (
    <header className="bg-white border-b border-orange-100 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* 로고 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xl" aria-hidden="true">❤️</span>
          <span className="font-bold text-gray-800">CoupleTask</span>
        </div>

        {/* 중앙 파트너 상태 (sm 이상) */}
        <div className="hidden sm:flex items-center gap-2 min-w-0">
          {partner ? (
            <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-orange-50
              px-3 py-1.5 rounded-full border border-orange-100 truncate max-w-[240px]">
              <span aria-hidden="true">💑</span>
              <span>
                <span className="text-orange-600 font-medium">{currentUser?.displayName}</span>
                {' '}·{' '}
                <span className="text-orange-600 font-medium">{partner.displayName}</span>
                <span className="text-gray-400 ml-1">연결됨</span>
              </span>
            </span>
          ) : currentUser && (
            <span className="text-xs text-gray-400">
              안녕하세요, <span className="text-gray-600 font-medium">{currentUser.displayName}</span>님
            </span>
          )}
        </div>

        {/* 로그아웃 */}
        <button
          onClick={() => signOut()}
          className="min-h-[36px] text-xs text-gray-400 hover:text-gray-600
            border border-gray-200 rounded-lg px-3 py-1.5 transition-all flex-shrink-0
            focus:outline-none focus:ring-2 focus:ring-orange-300"
          aria-label="로그아웃"
        >
          로그아웃
        </button>
      </div>
    </header>
  )
}
