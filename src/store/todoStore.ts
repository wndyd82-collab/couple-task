import { create } from 'zustand'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Todo } from '../types'

type Category = '전체' | '업무' | '개인' | '공부'

interface TodoState {
  myTodos: Todo[]
  partnerTodos: Todo[]
  isLoading: boolean
  activeFilter: Category

  subscribeMyTodos: (userId: string) => Unsubscribe
  subscribePartnerTodos: (partnerId: string) => Unsubscribe
  addTodo: (userId: string, title: string, category: Todo['category']) => Promise<void>
  updateTodo: (id: string, data: Partial<Pick<Todo, 'title' | 'category'>>) => Promise<void>
  toggleComplete: (id: string, currentStatus: boolean) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  setFilter: (category: Category) => void
}

export const useTodoStore = create<TodoState>((set) => ({
  myTodos: [],
  partnerTodos: [],
  isLoading: false,
  activeFilter: '전체',

  subscribeMyTodos: (userId) => {
    set({ isLoading: true })
    const q = query(
      collection(db, 'todos'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Todo)
      set({ myTodos: todos, isLoading: false })
    }, () => {
      set({ isLoading: false })
    })
    return unsubscribe
  },

  subscribePartnerTodos: (partnerId) => {
    const q = query(
      collection(db, 'todos'),
      where('userId', '==', partnerId),
      orderBy('createdAt', 'desc'),
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Todo)
      set({ partnerTodos: todos })
    }, () => {})
    return unsubscribe
  },

  addTodo: async (userId, title, category) => {
    await addDoc(collection(db, 'todos'), {
      userId,
      title: title.trim(),
      category,
      isCompleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  },

  updateTodo: async (id, data) => {
    await updateDoc(doc(db, 'todos', id), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  },

  toggleComplete: async (id, currentStatus) => {
    await updateDoc(doc(db, 'todos', id), {
      isCompleted: !currentStatus,
      updatedAt: serverTimestamp(),
    })
  },

  deleteTodo: async (id) => {
    await deleteDoc(doc(db, 'todos', id))
  },

  setFilter: (category) => set({ activeFilter: category }),
}))
