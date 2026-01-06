import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useFollowingUserIds } from '@/hooks/useFollowingUserIds'
import { usePosts } from '@/hooks/usePosts'
import { PostCard } from '@/components/PostCard'
import { PostSearchCollapsible, type TagMode } from '@/components/PostSearchCollapsible'
import { supabase } from '@/lib/supabase'

export function FollowingPage() {
  const { user, postsRefreshKey, bumpProfileRefreshKey } = useAuth()
  const { userIds: followingIds, loading: followingLoading, error: followingError } = useFollowingUserIds(user?.id)

  const [postSearch, setPostSearch] = useState<{ text: string; tags: string[]; tagMode: TagMode }>({
    text: '',
    tags: [],
    tagMode: 'union',
  })

  const { posts, loading, error } = usePosts({
    limit: 50,
    userIds: followingIds,
    refreshKey: postsRefreshKey,
    searchText: postSearch.text,
    searchTags: postSearch.tags,
    tagMode: postSearch.tagMode,
    viewerUserId: user?.id ?? null,
  })

  return (
    <div className="space-y-4">
      <div className="text-2xl font-semibold">Following</div>

      <PostSearchCollapsible
        title="Search posts"
        value={postSearch}
        onSearch={async (next) => {
          setPostSearch(next)
          if (user && next.tags.length > 0) {
            await Promise.all(
              next.tags.map((tag) =>
                supabase.rpc('add_usually_viewed_tag', { p_user_id: user.id, p_tag: tag })
              )
            )
            bumpProfileRefreshKey()
          }
        }}
        onClear={() => setPostSearch({ text: '', tags: [], tagMode: 'union' })}
      />

      {followingLoading ? (
        <div className="text-muted-foreground">Loading following...</div>
      ) : followingError ? (
        <div className="text-destructive">{followingError}</div>
      ) : followingIds.length === 0 ? (
        <div className="text-muted-foreground">You aren’t following anyone yet.</div>
      ) : loading ? (
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
