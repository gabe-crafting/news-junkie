import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AppRightRail() {
  return (
    <div className="h-full flex flex-col gap-6">
      <Button className="w-full justify-center gap-2" disabled>
        <Plus className="h-4 w-4" />
        Create Post
      </Button>

      <Card className="border-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Usually Viewed Tags</CardTitle>
          <Button variant="ghost" size="icon" disabled aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="outline">pnl</Badge>
          <Badge variant="outline">cringe</Badge>
        </CardContent>
      </Card>
    </div>
  )
}


