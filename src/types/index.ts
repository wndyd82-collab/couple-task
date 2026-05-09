import { Timestamp } from 'firebase/firestore'

export interface User {
  uid: string
  displayName: string
  partnerId: string | null
  inviteCode: string
}

export interface Todo {
  id: string
  userId: string
  title: string
  category: '업무' | '개인' | '공부'
  isCompleted: boolean
  dueDate?: string
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
