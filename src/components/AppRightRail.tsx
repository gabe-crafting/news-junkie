import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreatePostDialog } from '@/components/CreatePostDialog'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAuth } from '@/hooks/useAuth'
import { useUsuallyViewedTags } from '@/hooks/useUsuallyViewedTags'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function AppRightRail() {
  const { user, profileRefreshKey, bumpProfileRefreshKey } = useAuth()
  const { tags } = useUsuallyViewedTags(user?.id, profileRefreshKey)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [clearing, setClearing] = useState(false)
  const [clearError, setClearError] = useState<string | null>(null)

  const selectedTags = useMemo(() => {
    const raw = searchParams.get('tags') ?? ''
    return raw
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
  }, [searchParams])

  const toggleValueChange = (next: string[]) => {
    const nextTags = next.map((t) => t.trim().toLowerCase()).filter(Boolean)
    const params = new URLSearchParams(searchParams)
    if (nextTags.length > 0) params.set('tags', nextTags.join(','))
    else params.delete('tags')

    // Ensure we land on Home (tags filter applies to posts feed)
    const path = location.pathname.startsWith('/app/home') ? location.pathname : '/app/home'
    navigate(`${path}?${params.toString()}`)
  }

  const handleClearUsuallyViewedTags = async () => {
    if (!user || clearing) return
    setClearing(true)
    setClearError(null)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ usually_viewed_tags: [] })
        .eq('id', user.id)

      if (error) throw error

      // Clear tag filters too (so Home isn't filtering by stale tag selection)
      const params = new URLSearchParams(searchParams)
      params.delete('tags')
      const path = location.pathname.startsWith('/app/home') ? location.pathname : '/app/home'
      navigate(`${path}?${params.toString()}`)

      bumpProfileRefreshKey()
    } catch (e: unknown) {
      setClearError(e instanceof Error ? e.message : 'Failed to clear tags')
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <CreatePostDialog triggerClassName="w-full justify-center gap-2" />

      <Card className="border-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Usually Viewed Tags</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Clear usually viewed tags"
            title="Clear usually viewed tags"
            onClick={() => void handleClearUsuallyViewedTags()}
            disabled={!user || clearing}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {clearError ? <div className="mb-2 text-sm text-destructive">{clearError}</div> : null}
          {tags.length === 0 ? (
            <div className="text-sm text-muted-foreground">No tags yet.</div>
          ) : (
            <ToggleGroup
              type="multiple"
              value={selectedTags}
              onValueChange={toggleValueChange}
              variant="outline"
              size="sm"
              spacing={8}
              className="flex w-full flex-wrap justify-start gap-2"
            >
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag)
                return (
                  <ToggleGroupItem
                    key={tag}
                    value={tag}
                    className="rounded-full border border-input bg-transparent px-3 shadow-none hover:bg-transparent hover:text-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground"
                  >
                    {isSelected ? <Check className="size-4" /> : null}
                    {tag}
                  </ToggleGroupItem>
                )
              })}
            </ToggleGroup>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


