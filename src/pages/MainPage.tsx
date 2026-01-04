import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function MainPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-[600px] mx-auto text-center space-y-8">
        <h1 className="text-5xl font-bold leading-tight">News Junkie</h1>
        <p className="text-xl text-muted-foreground">
          Stay informed with the latest news and updates
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

