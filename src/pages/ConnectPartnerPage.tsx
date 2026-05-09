import { useState, type FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Input from '../components/Input'
import Button from '../components/Button'

export default function ConnectPartnerPage() {
  const navigate = useNavigate()
  const { currentUser, partner, connectPartner, signOut, isLoading, error, clearError } = useAuthStore()

  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (partner) navigate('/dashboard', { replace: true })
  }, [partner, navigate])

  const handleCopy = async () => {
    if (!currentUser?.inviteCode) return
    try {
      await navigator.clipboard.writeText(currentUser.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API 미지원 환경 fallback
      const el = document.createElement('textarea')
      el.value = currentUser.inviteCode
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">💌</div>
          <h1 className="text-2xl font-bold text-gray-800">파트너 연결</h1>
          <p className="text-sm text-gray-500 mt-1">
            안녕하세요, <span className="text-orange-500 font-medium">{currentUser?.displayName}</span>님!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-orange-100 p-8 flex flex-col gap-6">
          {/* 내 초대 코드 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">내 초대 코드</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-center">
                <span className="text-2xl font-mono font-bold tracking-widest text-orange-600">
                  {currentUser?.inviteCode}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="px-4 py-3 rounded-xl border border-orange-200 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-all whitespace-nowrap"
              >
                {copied ? '복사됨 ✓' : '복사'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">이 코드를 상대방에게 공유하세요.</p>
          </div>

          <div className="border-t border-orange-100" />

          {/* 상대방 코드 입력 */}
          <form onSubmit={handleConnect} className="flex flex-col gap-4">
            <Input
              label="상대방 초대 코드 입력"
              id="partner-code"
              type="text"
              placeholder="6자리 코드 (예: AB1C2D)"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase())
                clearError()
              }}
              maxLength={6}
              autoComplete="off"
            />
            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <Button type="submit" isLoading={isLoading} disabled={inviteCode.length !== 6}>
              연결하기
            </Button>
          </form>

          <button
            onClick={() => signOut()}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors text-center"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}
