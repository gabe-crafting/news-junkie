import { useMemo, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePosts } from '@/hooks/usePosts'
import { PostCard } from '@/components/PostCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { isValidTag } from '@/hooks/usePostMutations'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Switch } from '@/components/ui/switch'

export function HomePage() {
  const { user, postsRefreshKey, bumpProfileRefreshKey } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const appliedText = searchParams.get('q') ?? ''
  const appliedTagMode =
    searchParams.get('tagMode') === 'intersection' ? 'intersection' : 'union'
  const appliedTags = useMemo(() => {
    const raw = searchParams.get('tags') ?? ''
    return raw
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
  }, [searchParams])

  const { posts, loading, error } = usePosts({
    limit: 50,
    refreshKey: postsRefreshKey,
    searchText: appliedText,
    searchTags: appliedTags,
    tagMode: appliedTagMode,
    viewerUserId: user?.id ?? null,
  })
  const [searchOpen, setSearchOpen] = useState(false)

  // Draft form state (what user is typing)
  const [draftText, setDraftText] = useState('')
  const [draftTagInput, setDraftTagInput] = useState('')
  const [draftTags, setDraftTags] = useState<string[]>([])
  const [draftError, setDraftError] = useState<string | null>(null)
  const [draftTagMode, setDraftTagMode] = useState<'union' | 'intersection'>('union')

  const addDraftTag = (raw: string) => {
    const next = raw.trim().toLowerCase()
    if (!next) return
    if (!isValidTag(next)) {
      setDraftError('Tags must be a single lowercase word with no special characters.')
      return
    }
    setDraftTags((prev) => (prev.includes(next) ? prev : [...prev, next]))
    setDraftTagInput('')
    setDraftError(null)
  }

  const removeDraftTag = (tag: string) => {
    setDraftTags((prev) => prev.filter((t) => t !== tag))
  }

  const onDraftTagKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addDraftTag(draftTagInput)
    }
  }

  const applySearch = async () => {
    const nextText = draftText.trim()
    const nextTags = draftTags
    const nextTagMode = draftTagMode

    const params = new URLSearchParams(searchParams)
    if (nextText) params.set('q', nextText)
    else params.delete('q')

    if (nextTags.length > 0) params.set('tags', nextTags.join(','))
    else params.delete('tags')

    if (nextTags.length > 0 && nextTagMode === 'intersection') params.set('tagMode', 'intersection')
    else params.delete('tagMode')

    setSearchParams(params)
    setSearchOpen(false)

    // Track tags as "usually viewed"
    if (user && nextTags.length > 0) {
      await Promise.all(
        nextTags.map((tag) =>
          supabase.rpc('add_usually_viewed_tag', { p_user_id: user.id, p_tag: tag })
        )
      )
      bumpProfileRefreshKey()
    }
  }

  const clearSearch = () => {
    setDraftText('')
    setDraftTagInput('')
    setDraftTags([])
    setDraftError(null)
    setDraftTagMode('union')
    const params = new URLSearchParams(searchParams)
    params.delete('q')
    params.delete('tags')
    params.delete('tagMode')
    setSearchParams(params)
  }

  return (
    <div className="space-y-4">
      <Collapsible
        open={searchOpen}
        onOpenChange={(next) => {
          setSearchOpen(next)
          if (next) {
            setDraftError(null)
            setDraftText(appliedText)
            setDraftTags(appliedTags)
            setDraftTagInput('')
            setDraftTagMode(appliedTagMode)
          }
        }}
      >
        <CollapsibleTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-between">
            <span className="inline-flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-3">
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="home-search-text">
                Text
              </label>
              <Input
                id="home-search-text"
                placeholder="Search posts"
                value={draftText}
                onChange={(e) => {
                  setDraftError(null)
                  setDraftText(e.target.value)
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="home-search-tag">
                Tag
              </label>
              <Input
                id="home-search-tag"
                placeholder="type a tag and press Enter"
                value={draftTagInput}
                onChange={(e) => {
                  setDraftError(null)
                  setDraftTagInput(e.target.value)
                }}
                onKeyDown={onDraftTagKeyDown}
              />

              {draftTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {draftTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        className="ml-1 inline-flex items-center justify-center"
                        onClick={() => removeDraftTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            {draftError ? <div className="text-sm text-destructive">{draftError}</div> : null}

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Intersection</span>
                <Switch
                  checked={draftTagMode === 'union'}
                  onCheckedChange={(checked) => setDraftTagMode(checked ? 'union' : 'intersection')}
                  aria-label="Toggle tag match mode"
                />
                <span className="text-xs text-muted-foreground">Union</span>
              </div>

              <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={clearSearch}>
                Clear
              </Button>
              <Button type="button" onClick={() => void applySearch()}>
                Search
              </Button>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {loading ? (
        <div className="text-muted-foreground">Loading posts...</div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : posts.length === 0 ? (
        <div className="text-muted-foreground">No posts yet.</div>
      ) : (
        <div className="space-y-0">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
