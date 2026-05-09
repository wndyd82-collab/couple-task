import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoadingSpinner from './components/LoadingSpinner'
import PrivateRoute from './components/PrivateRoute'
import AuthPage from './pages/AuthPage'
import ConnectPartnerPage from './pages/ConnectPartnerPage'
import DashboardPage from './pages/DashboardPage'
import ToastContainer from './components/Toast'

function RootRedirect() {
  const { currentUser, isLoading } = useAuthStore()

  if (isLoading) return <LoadingSpinner />
  if (!currentUser) return <Navigate to="/auth" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  const listenToAuth = useAuthStore((s) => s.listenToAuth)

  useEffect(() => {
    const unsubscribe = listenToAuth()
    return unsubscribe
  }, [listenToAuth])

  return (
    <>
    <ToastContainer />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/connect"
          element={
            <PrivateRoute>
              <ConnectPartnerPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}
