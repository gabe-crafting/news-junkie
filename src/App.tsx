import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import { MainPage } from './pages/MainPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { HomePage } from './pages/HomePage'
import { ProfilePage } from './pages/ProfilePage'
import { FollowingPage } from './pages/FollowingPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Redirect /app to /app/home */}
          <Route path="/app" element={<Navigate to="/app/home" replace />} />
          <Route
            path="/app/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/following"
            element={
              <ProtectedRoute>
                <FollowingPage />
              </ProtectedRoute>
            }
          />
          {/* Redirect old followers route to following */}
          <Route path="/app/followers" element={<Navigate to="/app/following" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
