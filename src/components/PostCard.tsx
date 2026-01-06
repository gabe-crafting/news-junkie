import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import type { Post } from '@/hooks/usePosts'
import { useAuth } from '@/hooks/useAuth'
import { PostEditDialog } from '@/components/PostEditDialog'
import { PostDeleteDialog } from '@/components/PostDeleteDialog'

type PostCardProps = {
  post: Post
}

function formatCreatedAt(createdAt: string): string | null {
  const d = new Date(createdAt)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString()
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth()
  const authorName = post.author?.name ?? 'Unknown'
  const fallback = authorName.trim().slice(0, 1).toUpperCase() || '?'
  const createdAtLabel = formatCreatedAt(post.created_at)
  const isOwnPost = user?.id === post.user_id
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const handleCopyNewsLink = async () => {
    try {
      if (!('clipboard' in navigator)) return
      await navigator.clipboard.writeText(post.news_link)
    } catch {
      // no-op: clipboard permissions can fail depending on browser context
    }
  }

  const openEdit = () => {
    if (!isOwnPost) return
    setEditOpen(true)
  }

  return (
    <Card className="rounded-none border-x-0 border-t-0 shadow-none bg-transparent gap-3 py-2">
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
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex items-center gap-0">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-6"
          onClick={() => void handleCopyNewsLink()}
          aria-label="Copy news link"
          title="Copy news link"
        >
          <Copy className="size-3" />
        </Button>

        {isOwnPost ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-6"
              onClick={openEdit}
              aria-label="Edit post"
              title="Edit post"
            >
              <Pencil className="size-3" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-6"
              onClick={() => {
                setDeleteOpen(true)
              }}
              aria-label="Delete post"
              title="Delete post"
            >
              <Trash2 className="size-3" />
            </Button>
          </>
        ) : null}

        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          className="size-6"
          aria-label="Open news link"
          title="Open news link"
        >
          <a href={post.news_link} target="_blank" rel="noreferrer">
            <ExternalLink className="size-3" />
          </a>
        </Button>
      </CardFooter>

      {isOwnPost ? <PostEditDialog post={post} open={editOpen} onOpenChange={setEditOpen} /> : null}
      {isOwnPost ? <PostDeleteDialog post={post} open={deleteOpen} onOpenChange={setDeleteOpen} /> : null}
    </Card>
  )
}


