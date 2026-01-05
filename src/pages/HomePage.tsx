import { useMemo, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePosts } from '@/hooks/usePosts'
import { PostCard } from '@/components/PostCard'
import { Input } from '@/components/ui/input'

export function HomePage() {
  useAuth()
  const { posts, loading, error } = usePosts({ limit: 50 })
  const [query, setQuery] = useState('')

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return posts

    return posts.filter((p) => {
      const author = (p.author?.name ?? '').toLowerCase()
      const description = p.description.toLowerCase()
      const tags = p.tags.map((t) => t.toLowerCase())
      return (
        description.includes(q) ||
        author.includes(q) ||
        tags.some((t) => t.includes(q))
      )
    })
  }, [posts, query])

  return (
    <div className="space-y-4">
      <div className="w-full">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9"
            aria-label="Search posts"
          />
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading posts...</div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-muted-foreground">No posts yet.</div>
      ) : (
        <div className="space-y-0">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
