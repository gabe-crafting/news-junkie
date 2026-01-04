import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export function AppNavigation() {
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="w-full max-w-[1280px] mx-auto p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/app" className="hover:opacity-80 transition-opacity">
            <img
              src="/news_junkie1.png"
              alt="News Junkie"
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex space-x-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/home">Home</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/profile">Profile</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/following">Following</Link>
            </Button>
          </div>
        </div>
        <Button onClick={handleSignOut} variant="outline" size="sm">
          Logout
        </Button>
      </div>
    </nav>
  )
}
