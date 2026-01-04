import { AppNavigation } from '@/components/AppNavigation'
import { useAuth } from '@/hooks/useAuth'

export function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      <AppNavigation />
      <div className="w-full max-w-[1280px] mx-auto px-8 pb-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Home</h1>
          <h2 className="text-2xl font-semibold">Welcome Home, {user?.email || 'User'}!</h2>
          <p className="text-muted-foreground">
            This is your home feed. News and updates will appear here.
          </p>
        </div>
      </div>
    </div>
  )
}
