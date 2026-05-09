import { create } from 'zustand'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { User } from '../types'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

interface AuthState {
  currentUser: User | null
  partner: User | null
  isLoading: boolean
  error: string | null

  signUp: (email: string, password: string, displayName: string, partnerInviteCode?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  connectPartner: (inviteCode: string) => Promise<void>
  listenToAuth: () => () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  partner: null,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  signUp: async (email, password, displayName, partnerInviteCode) => {
    set({ isLoading: true, error: null })
    try {
      // 초대 코드가 있으면 먼저 유효성 확인
      let partnerData: User | null = null
      if (partnerInviteCode) {
        const q = query(collection(db, 'users'), where('inviteCode', '==', partnerInviteCode.toUpperCase()))
        const snapshot = await getDocs(q)
        if (snapshot.empty) {
          set({ error: '유효하지 않은 초대 코드입니다.', isLoading: false })
          throw new Error('유효하지 않은 초대 코드입니다.')
        }
        partnerData = snapshot.docs[0].data() as User
        if (partnerData.partnerId) {
          set({ error: '이미 파트너가 있는 사용자의 코드입니다.', isLoading: false })
          throw new Error('이미 파트너가 있는 사용자의 코드입니다.')
        }
      }

      const credential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = credential.user.uid
      const myInviteCode = generateInviteCode()

      const userData: User = {
        uid,
        displayName,
        partnerId: partnerData ? partnerData.uid : null,
        inviteCode: myInviteCode,
      }

      await setDoc(doc(db, 'users', uid), userData)

      // 파트너 연결
      if (partnerData) {
        await updateDoc(doc(db, 'users', partnerData.uid), { partnerId: uid })
        set({ currentUser: userData, partner: partnerData, isLoading: false })
      } else {
        set({ currentUser: userData, isLoading: false })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '회원가입에 실패했습니다.'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // listenToAuth가 currentUser를 채워줌
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '로그인에 실패했습니다.'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null })
    try {
      await firebaseSignOut(auth)
      set({ currentUser: null, partner: null, isLoading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '로그아웃에 실패했습니다.'
      set({ error: message, isLoading: false })
    }
  },

  connectPartner: async (inviteCode) => {
    const { currentUser } = get()
    if (!currentUser) throw new Error('로그인이 필요합니다.')

    set({ isLoading: true, error: null })
    try {
      const q = query(collection(db, 'users'), where('inviteCode', '==', inviteCode.toUpperCase()))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        set({ error: '유효하지 않은 초대 코드입니다.', isLoading: false })
        return
      }

      const partnerDoc = snapshot.docs[0]
      const partnerData = partnerDoc.data() as User

      if (partnerData.uid === currentUser.uid) {
        set({ error: '본인의 초대 코드는 사용할 수 없습니다.', isLoading: false })
        return
      }

      if (partnerData.partnerId) {
        set({ error: '이미 파트너가 있는 사용자입니다.', isLoading: false })
        return
      }

      // 양쪽 partnerId 업데이트
      await Promise.all([
        updateDoc(doc(db, 'users', currentUser.uid), { partnerId: partnerData.uid }),
        updateDoc(doc(db, 'users', partnerData.uid), { partnerId: currentUser.uid }),
      ])

      const updatedUser = { ...currentUser, partnerId: partnerData.uid }
      set({ currentUser: updatedUser, partner: partnerData, isLoading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '파트너 연결에 실패했습니다.'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  listenToAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        set({ currentUser: null, partner: null, isLoading: false })
        return
      }

      try {
        const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (!userSnap.exists()) {
          set({ currentUser: null, partner: null, isLoading: false })
          return
        }

        const userData = userSnap.data() as User

        let partnerData: User | null = null
        if (userData.partnerId) {
          const partnerSnap = await getDoc(doc(db, 'users', userData.partnerId))
          if (partnerSnap.exists()) {
            partnerData = partnerSnap.data() as User
          }
        }

        set({ currentUser: userData, partner: partnerData, isLoading: false })
      } catch {
        set({ currentUser: null, partner: null, isLoading: false })
      }
    })

    return unsubscribe
  },
}))
