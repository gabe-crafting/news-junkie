import { useAuth } from '@/hooks/useAuth'
import { usePosts } from '@/hooks/usePosts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function HomePage() {
  const { user } = useAuth()
  const { posts, loading, error } = usePosts({ limit: 50 })

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Home</h1>
      <h2 className="text-2xl font-semibold">Welcome Home, {user?.email || 'User'}!</h2>
      <p className="text-muted-foreground">
        This is your home feed. News and updates will appear here.
      </p>

      <div className="space-y-4">
        {loading ? (
          <div className="text-muted-foreground">Loading posts...</div>
        ) : error ? (
          <div className="text-destructive">{error}</div>
        ) : posts.length === 0 ? (
          <div className="text-muted-foreground">No posts yet.</div>
        ) : (
          posts.map((post) => {
            const authorName = post.author?.name ?? 'Unknown'
            const fallback = authorName.trim().slice(0, 1).toUpperCase() || '?'
            const createdAt = new Date(post.created_at)
            const createdAtLabel = Number.isNaN(createdAt.getTime()) ? '' : createdAt.toLocaleString()

            return (
              <Card key={post.id}>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      {post.author?.profile_picture_url ? (
                        <AvatarImage src={post.author.profile_picture_url} alt={authorName} />
                      ) : null}
                      <AvatarFallback>{fallback}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{authorName}</CardTitle>
                      {createdAtLabel ? (
                        <div className="text-xs text-muted-foreground">{createdAtLabel}</div>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  <p className="whitespace-pre-wrap">{post.description}</p>
                  {post.tags.length > 0 ? (
                    <div className="text-xs text-muted-foreground">
                      Tags: {post.tags.join(', ')}
                    </div>
                  ) : null}
                </CardContent>

                <CardFooter className="flex flex-wrap gap-2 justify-end">
                  <Button asChild size="sm">
                    <a href={post.news_link} target="_blank" rel="noreferrer">
                      Open news
                    </a>
                  </Button>
                  {post.archive_link ? (
                    <Button asChild variant="outline" size="sm">
                      <a href={post.archive_link} target="_blank" rel="noreferrer">
                        Open archive
                      </a>
                    </Button>
                  ) : null}
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
