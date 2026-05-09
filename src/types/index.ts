import { Timestamp } from 'firebase/firestore'

export interface User {
  uid: string
  displayName: string
  partnerId: string | null
  inviteCode: string
}

export type Assignee = 'me' | 'partner' | 'both'

export interface Todo {
  id: string
  userId: string
  title: string
  category: '살림' | '데이트' | '건강' | '약속' | '기타'
  assignee?: Assignee | null
  isCompleted: boolean
  dueDate?: string | null
  thankYou?: { userId: string; at: Timestamp } | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Comment {
  id: string
  todoId: string
  authorId: string
  authorName: string
  content: string
  createdAt: Timestamp
}
