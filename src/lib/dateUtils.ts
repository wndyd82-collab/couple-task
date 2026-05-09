import type { Timestamp } from 'firebase/firestore'

export function formatRelativeTime(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return ''

  const now = Date.now()
  const time = timestamp.toDate().getTime()
  const diff = now - time

  if (diff < 60_000) return '방금 전'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}일 전`
  return timestamp.toDate().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}
