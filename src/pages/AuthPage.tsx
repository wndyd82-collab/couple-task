import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Input from '../components/Input'
import Button from '../components/Button'

type Tab = 'signin' | 'signup'

function getFirebaseErrorMessage(message: string): string {
  if (message.includes('email-already-in-use')) return '이미 사용 중인 이메일입니다.'
  if (message.includes('user-not-found') || message.includes('wrong-password') || message.includes('invalid-credential'))
    return '이메일 또는 비밀번호가 올바르지 않습니다.'
  if (message.includes('weak-password')) return '비밀번호는 6자 이상이어야 합니다.'
  if (message.includes('invalid-email')) return '유효하지 않은 이메일 형식입니다.'
  if (message.includes('too-many-requests')) return '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.'
  if (message.includes('유효하지 않은 초대 코드')) return '유효하지 않은 초대 코드입니다.'
  if (message.includes('이미 파트너가 있는')) return '이미 파트너가 연결된 코드입니다.'
  return '오류가 발생했습니다. 다시 시도해주세요.'
}

export default function AuthPage() {
  const navigate = useNavigate()
  const { signIn, signUp, isLoading, error, clearError } = useAuthStore()

  const [tab, setTab] = useState<Tab>('signin')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [partnerCode, setPartnerCode] = useState('')
  const [localError, setLocalError] = useState('')

  const switchTab = (next: Tab) => {
    setTab(next)
    setLocalError('')
    clearError()
  }

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError('')
    clearError()
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err: unknown) {
      if (err instanceof Error) setLocalError(getFirebaseErrorMessage(err.message))
    }
  }

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    if (!displayName.trim()) {
      setLocalError('표시 이름을 입력해주세요.')
      return
    }
    if (password !== passwordConfirm) {
      setLocalError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (password.length < 6) {
      setLocalError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    try {
      await signUp(email, password, displayName.trim(), partnerCode.trim() || undefined)
      navigate('/dashboard')
    } catch (err: unknown) {
      if (err instanceof Error) setLocalError(getFirebaseErrorMessage(err.message))
    }
  }

  const displayError = localError || (error ? getFirebaseErrorMessage(error) : '')

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 로고 영역 */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">💑</div>
          <h1 className="text-2xl font-bold text-gray-800">CoupleTask</h1>
          <p className="text-sm text-gray-500 mt-1">함께하는 할 일 관리</p>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-2xl shadow-lg shadow-orange-100 p-8">
          {/* 탭 */}
          <div className="flex rounded-xl bg-orange-50 p-1 mb-6">
            {(['signin', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'signin' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          {/* 로그인 폼 */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <Input
                label="이메일"
                id="signin-email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                label="비밀번호"
                id="signin-password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              {displayError && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{displayError}</p>
              )}
              <Button type="submit" isLoading={isLoading} className="mt-2">
                로그인
              </Button>
            </form>
          )}

          {/* 회원가입 폼 */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              <Input
                label="표시 이름"
                id="signup-name"
                type="text"
                placeholder="상대방에게 보일 이름"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoComplete="nickname"
              />
              <Input
                label="이메일"
                id="signup-email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                label="비밀번호"
                id="signup-password"
                type="password"
                placeholder="6자 이상"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <Input
                label="비밀번호 확인"
                id="signup-password-confirm"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                autoComplete="new-password"
                error={passwordConfirm && password !== passwordConfirm ? '비밀번호가 일치하지 않습니다.' : ''}
              />
              <div className="border-t border-gray-100 pt-4">
                <Input
                  label="파트너 초대 코드 (선택)"
                  id="signup-partner-code"
                  type="text"
                  placeholder="파트너에게 받은 6자리 코드"
                  value={partnerCode}
                  onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                  autoComplete="off"
                />
                <p className="text-xs text-gray-400 mt-1">코드가 없으면 가입 후 연결할 수 있어요</p>
              </div>
              {displayError && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{displayError}</p>
              )}
              <Button type="submit" isLoading={isLoading} className="mt-2">
                회원가입
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
