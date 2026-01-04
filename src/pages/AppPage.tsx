import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function AppPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="w-full max-w-[1280px] mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">News Junkie</h1>
          <Button asChild variant="outline">
            <Link to="/">Logout</Link>
          </Button>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Welcome to News Junkie</h2>
          <p className="text-muted-foreground">
            This is the main application page. Your news feed will appear here.
          </p>
        </div>
      </div>
    </div>
  )
}

