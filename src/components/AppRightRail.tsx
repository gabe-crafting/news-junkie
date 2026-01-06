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
import { Switch } from '@/components/ui/switch'

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

  const tagMode = searchParams.get('tagMode') === 'intersection' ? 'intersection' : 'union'

  const toggleValueChange = (next: string[]) => {
    const nextTags = next.map((t) => t.trim().toLowerCase()).filter(Boolean)
    const params = new URLSearchParams(searchParams)
    if (nextTags.length > 0) params.set('tags', nextTags.join(','))
    else params.delete('tags')

    // Ensure we land on Home (tags filter applies to posts feed)
    const path = location.pathname.startsWith('/app/home') ? location.pathname : '/app/home'
    navigate(`${path}?${params.toString()}`)
  }

  const setTagMode = (nextMode: 'union' | 'intersection') => {
    const params = new URLSearchParams(searchParams)
    // only meaningful if there are selected tags
    if (selectedTags.length > 0 && nextMode === 'intersection') params.set('tagMode', 'intersection')
    else params.delete('tagMode')
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
            <div className="space-y-3">
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Intersection</span>
                  <Switch
                    checked={tagMode === 'union'}
                    onCheckedChange={(checked) => setTagMode(checked ? 'union' : 'intersection')}
                    aria-label="Toggle tag match mode"
                    disabled={selectedTags.length === 0}
                  />
                  <span className="text-xs text-muted-foreground">Union</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


