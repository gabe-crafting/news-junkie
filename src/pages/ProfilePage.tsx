import { AppNavigation } from '@/components/AppNavigation'
import { useAuth } from '@/hooks/useAuth'

export function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      <AppNavigation />
      <div className="w-full max-w-[1280px] mx-auto px-8 pb-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Profile</h1>
          <h2 className="text-2xl font-semibold">Your Profile</h2>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Email: {user?.email || 'Not available'}
            </p>
            <p className="text-muted-foreground">
              User ID: {user?.id || 'Not available'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
