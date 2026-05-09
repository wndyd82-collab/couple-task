import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import LoadingSpinner from './LoadingSpinner'

interface PrivateRouteProps {
  children: React.ReactNode
  requirePartner?: boolean
}

export default function PrivateRoute({ children, requirePartner = false }: PrivateRouteProps) {
  const { currentUser, partner, isLoading } = useAuthStore()

  if (isLoading) return <LoadingSpinner />
  if (!currentUser) return <Navigate to="/auth" replace />
  if (requirePartner && !partner) return <Navigate to="/connect" replace />

  return <>{children}</>
}
