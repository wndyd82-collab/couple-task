import { useToastStore } from '../store/toastStore'

function ToastItem({ id, message, type }: { id: string; message: string; type: 'success' | 'error' }) {
  const dismiss = useToastStore((s) => s.dismissToast)

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
        text-white w-full animate-slide-up
        ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
    >
      <span className="text-base flex-shrink-0" aria-hidden="true">
        {type === 'success' ? '✓' : '✕'}
      </span>
      <span className="flex-1">{message}</span>
      <button
        onClick={() => dismiss(id)}
        className="opacity-60 hover:opacity-100 transition-opacity text-xl leading-none ml-1 flex-shrink-0"
        aria-label="알림 닫기"
      >
        ×
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  if (toasts.length === 0) return null

  return (
    <div
      aria-label="알림 목록"
      className="fixed bottom-20 sm:bottom-6 left-4 right-4
        sm:left-auto sm:right-6 sm:w-80
        z-50 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} />
        </div>
      ))}
    </div>
  )
}
