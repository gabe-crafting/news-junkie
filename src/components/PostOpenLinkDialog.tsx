import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Post } from '@/hooks/usePosts'

type PostOpenLinkDialogProps = {
  post: Post
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PostOpenLinkDialog({ post, open, onOpenChange }: PostOpenLinkDialogProps) {
  const hasArchiveLink = !!post.archive_link?.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Open link</DialogTitle>
          <DialogDescription>Review the link before opening it.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={`post-link-${post.id}`}>
            Link
          </label>
          <Textarea
            id={`post-link-${post.id}`}
            value={post.news_link}
            readOnly
            className="min-h-[80px]"
          />
        </div>

        {hasArchiveLink ? (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`post-archive-link-${post.id}`}>
              Archive link
            </label>
            <Textarea
              id={`post-archive-link-${post.id}`}
              value={post.archive_link ?? ''}
              readOnly
              className="min-h-[80px]"
            />
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {hasArchiveLink ? (
            <Button asChild variant="secondary">
              <a href={post.archive_link ?? ''} target="_blank" rel="noreferrer">
                Open archive
              </a>
            </Button>
          ) : null}
          <Button asChild>
            <a href={post.news_link} target="_blank" rel="noreferrer">
              Open
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


