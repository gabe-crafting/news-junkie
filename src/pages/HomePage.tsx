import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useInfinitePosts } from '@/hooks/useInfinitePosts'
import { PostCard } from '@/components/organisms/PostCard'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { isValidTag } from '@/hooks/usePostMutations'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useUsuallyViewedTags } from '@/hooks/useUsuallyViewedTags'

export function HomePage() {
  const { user, postsRefreshKey, bumpProfileRefreshKey, profileRefreshKey } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const { tags: usuallyViewedTags } = useUsuallyViewedTags(user?.id, profileRefreshKey)

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

  const { posts, initialLoading, loadingMore, error, hasMore, loadMore } = useInfinitePosts({
    pageSize: 30,
    refreshKey: postsRefreshKey,
    searchText: appliedText,
    searchTags: appliedTags,
    tagMode: appliedTagMode,
  })
  const [searchOpen, setSearchOpen] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return
    if (!hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (!first?.isIntersecting) return
        if (initialLoading || loadingMore) return
        void loadMore()
      },
      {
        // Start loading a bit before the bottom.
        root: null,
        rootMargin: '400px',
        threshold: 0,
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, initialLoading, loadMore, loadingMore])

  // Draft form state (what user is typing)
  const [draftText, setDraftText] = useState('')
  const [draftTagInput, setDraftTagInput] = useState('')
  const [draftTags, setDraftTags] = useState<string[]>([])
  const [draftError, setDraftError] = useState<string | null>(null)
  const [draftTagMode, setDraftTagMode] = useState<'union' | 'intersection'>('union')
  const [deletingTags, setDeletingTags] = useState(false)
  const [deleteTagsError, setDeleteTagsError] = useState<string | null>(null)

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

    // Add (or confirm) this tag in "usually viewed", so it shows up under the input next time.
    if (user) {
      void (async () => {
        await supabase.rpc('add_usually_viewed_tag', { p_user_id: user.id, p_tag: next })
        bumpProfileRefreshKey()
      })()
    }
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

  const availableTags = useMemo(() => {
    const merged = [...usuallyViewedTags, ...draftTags]
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
    return Array.from(new Set(merged))
  }, [draftTags, usuallyViewedTags])

  const handleDeleteUsuallyViewedTags = async () => {
    if (!user || deletingTags) return
    setDeletingTags(true)
    setDeleteTagsError(null)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ usually_viewed_tags: [] })
        .eq('id', user.id)

      if (error) throw error
      bumpProfileRefreshKey()
    } catch (e: unknown) {
      setDeleteTagsError(e instanceof Error ? e.message : 'Failed to delete tags')
    } finally {
      setDeletingTags(false)
    }
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

              {deleteTagsError ? <div className="text-sm text-destructive">{deleteTagsError}</div> : null}

              {availableTags.length > 0 ? (
                <ToggleGroup
                  type="multiple"
                  value={draftTags}
                  onValueChange={(next) => {
                    const normalized = next.map((t) => t.trim().toLowerCase()).filter(Boolean)
                    setDraftError(null)
                    setDraftTags(normalized)
                  }}
                  variant="outline"
                  size="sm"
                  spacing={8}
                  className="flex w-full flex-wrap justify-start gap-2"
                >
                  {availableTags.map((tag) => {
                    const isSelected = draftTags.includes(tag)
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleDeleteUsuallyViewedTags()}
                  disabled={!user || deletingTags}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete tags
                </Button>
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

      {initialLoading ? (
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

          <div ref={loadMoreRef} className="h-1" />

          {loadingMore ? (
            <div className="py-4 text-muted-foreground">Loading more...</div>
          ) : !hasMore ? (
            <div className="py-4 text-muted-foreground">You’re all caught up.</div>
          ) : null}
        </div>
      )}
    </div>
  )
}
