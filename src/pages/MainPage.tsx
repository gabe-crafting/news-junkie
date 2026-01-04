import { Link, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export function MainPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/app" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-[600px] mx-auto text-center space-y-8">
        <div className="flex justify-center">
          <img
            src="/news_junkie1.png"
            alt="News Junkie"
            className="h-24 w-auto"
          />
        </div>
        <p className="text-xl text-muted-foreground">
          A comfy platform where you can be a news junkie: post, browse your sources, download, index and search for them.
          To lazy to find news yourself? Just follow one of your favorite news junkies.
          No comments, no likes, no memes, no drama. Just news.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/register">Register</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

