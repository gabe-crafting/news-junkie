import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function ProfileRedirectPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={`/app/profile/${user.id}`} replace />
}


