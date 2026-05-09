import { useState, type FormEvent } from 'react'
import { useAuthStore } from '../store/authStore'

export default function InvitePanel() {
  const { currentUser, connectPartner, isLoading, error, clearError } = useAuthStore()
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!currentUser?.inviteCode) return
    try {
      await navigator.clipboard.writeText(currentUser.inviteCode)
    } catch {
      const el = document.createElement('textarea')
      el.value = currentUser.inviteCode
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConnect = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    if (!inviteCode.trim()) return
    try {
      await connectPartner(inviteCode.trim())
    } catch {
      // error는 store에서 관리
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 flex flex-col gap-6">
      <div className="text-center">
        <div className="text-3xl mb-2">💌</div>
        <h2 className="text-base font-semibold text-gray-800">파트너를 초대해보세요</h2>
        <p className="text-sm text-gray-400 mt-1">아래 코드를 공유하거나 상대방 코드를 입력하세요</p>
      </div>

      {/* 내 초대 코드 */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">내 초대 코드</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-center">
            <span className="text-2xl font-mono font-bold tracking-widest text-orange-600">
              {currentUser?.inviteCode}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="px-4 py-3 rounded-xl border border-orange-200 text-sm font-medium
              text-orange-600 hover:bg-orange-50 transition-all whitespace-nowrap
              focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {copied ? '복사됨 ✓' : '복사'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">이 코드를 파트너에게 공유하세요</p>
      </div>

      <div className="border-t border-gray-100" />

      {/* 상대방 코드 입력 */}
      <form onSubmit={handleConnect} className="flex flex-col gap-3">
        <p className="text-xs font-medium text-gray-500">파트너 코드 입력</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="6자리 코드 입력"
            value={inviteCode}
            onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); clearError() }}
            maxLength={6}
            autoComplete="off"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm
              font-mono tracking-widest text-center uppercase
              focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
          />
          <button
            type="submit"
            disabled={inviteCode.length !== 6 || isLoading}
            className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium
              hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all
              focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            {isLoading ? '연결 중...' : '연결하기'}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
      </form>
    </div>
  )
}
