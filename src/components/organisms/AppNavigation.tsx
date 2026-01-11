import { Link, NavLink } from 'react-router-dom'
import { Home, User, Users, Compass, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

interface AppNavigationProps {
  onNavigate?: () => void
  showBrand?: boolean
}

export function AppNavigation({ onNavigate, showBrand = true }: AppNavigationProps) {
  const { user, signOut, profileRefreshKey } = useAuth()
  const { profile } = useProfile(user?.id, profileRefreshKey)

  const handleSignOut = async () => {
    await signOut()
  }

  const displayName =
    profile?.name?.trim() ||
    (user?.email ? user.email.split('@')[0] : '') ||
    'User'

  const avatarFallback = displayName.slice(0, 1).toUpperCase() || '?'
  const profileHref = user ? `/app/profile/${user.id}` : '/app/profile'

  return (
    <div className="h-full flex flex-col gap-6">
      {showBrand ? (
        <Link to="/app/home" className="flex items-center gap-3">
          <img src="/news_junkie1.png" alt="News Junkie" className="h-full w-auto" />
        </Link>
      ) : null}

      <Card className="border-0 shadow-none">
        <CardContent className="p-2">
          <nav className="flex flex-col gap-1">
            <Button asChild variant="ghost" className="justify-start gap-2">
              <NavLink to="/app/home" onClick={onNavigate}>
                <Home className="h-4 w-4" />
                Home
              </NavLink>
            </Button>
            <Button asChild variant="ghost" className="justify-start gap-2">
              <NavLink to={profileHref} onClick={onNavigate}>
                <User className="h-4 w-4" />
                Profile
              </NavLink>
            </Button>
            <Button asChild variant="ghost" className="justify-start gap-2">
              <NavLink to="/app/following" onClick={onNavigate}>
                <Users className="h-4 w-4" />
                Following
              </NavLink>
            </Button>
            <Button asChild variant="ghost" className="justify-start gap-2">
              <NavLink to="/app/discover" onClick={onNavigate}>
                <Compass className="h-4 w-4" />
                Discover Junkies
              </NavLink>
            </Button>
          </nav>

          <div className="mt-2 pt-2 border-t">
            <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start gap-2">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-auto">
        <Card className="border-0 shadow-none">
          <CardContent className="p-3">
            <Link to={profileHref} className="flex items-center gap-3 min-w-0 hover:opacity-90 transition-opacity">
              <Avatar className="size-10">
                {profile?.profile_picture_url ? (
                  <AvatarImage src={profile.profile_picture_url} alt={displayName} />
                ) : null}
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="font-semibold truncate">{displayName}</div>
                <div className="text-sm text-muted-foreground truncate">{user?.email ?? ''}</div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

