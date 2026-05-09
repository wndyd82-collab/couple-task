import { create } from 'zustand'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthStore } from './authStore'
import type { Comment } from '../types'

// Module-level: survives store re-renders
let activeUnsubscribers: Unsubscribe[] = []

interface CommentState {
  commentsByTodoId: Record<string, Comment[]>
  isLoading: boolean

  subscribeComments: (todoIds: string[]) => void
  addComment: (todoId: string, content: string) => Promise<void>
  unsubscribeAll: () => void
}

export const useCommentStore = create<CommentState>((set) => ({
  commentsByTodoId: {},
  isLoading: false,

  subscribeComments: (todoIds) => {
    // 이전 구독 해제
    activeUnsubscribers.forEach((u) => u())
    activeUnsubscribers = []

    if (todoIds.length === 0) {
      set({ commentsByTodoId: {}, isLoading: false })
      return
    }

    set({ isLoading: true })

    // todoId별 빈 배열 초기화 (로딩 전 빈 상태 보장)
    const initial: Record<string, Comment[]> = {}
    todoIds.forEach((id) => { initial[id] = [] })
    set({ commentsByTodoId: initial })

    // Firestore 'in' 쿼리는 최대 30개 - 청크 분할
    for (let i = 0; i < todoIds.length; i += 30) {
      const chunk = todoIds.slice(i, i + 30)
      const q = query(
        collection(db, 'comments'),
        where('todoId', 'in', chunk),
        orderBy('createdAt', 'asc'),
      )

      const unsub = onSnapshot(q, (snapshot) => {
        const chunkMap: Record<string, Comment[]> = {}
        chunk.forEach((id) => { chunkMap[id] = [] })

        snapshot.docs.forEach((d) => {
          const comment = { id: d.id, ...d.data() } as Comment
          if (!chunkMap[comment.todoId]) chunkMap[comment.todoId] = []
          chunkMap[comment.todoId].push(comment)
        })

        set((state) => ({
          commentsByTodoId: { ...state.commentsByTodoId, ...chunkMap },
          isLoading: false,
        }))
      })

      activeUnsubscribers.push(unsub)
    }
  },

  addComment: async (todoId, content) => {
    const { currentUser } = useAuthStore.getState()
    if (!currentUser) throw new Error('로그인이 필요합니다.')

    await addDoc(collection(db, 'comments'), {
      todoId,
      authorId: currentUser.uid,
      authorName: currentUser.displayName,
      content: content.trim(),
      createdAt: serverTimestamp(),
    })
  },

  unsubscribeAll: () => {
    activeUnsubscribers.forEach((u) => u())
    activeUnsubscribers = []
  },
}))
