import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Post } from '@/hooks/usePosts'
import { useDeletePost } from '@/hooks/usePostMutations'

type PostDeleteDialogProps = {
  post: Post
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PostDeleteDialog({ post, open, onOpenChange }: PostDeleteDialogProps) {
  const { deletePost, loading: deleting, error: deleteError, resetError: resetDeleteError } = useDeletePost()

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) resetDeleteError()
    onOpenChange(nextOpen)
  }

  const handleDelete = async () => {
    const ok = await deletePost(post.id)
    if (ok) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete post?</DialogTitle>
          <DialogDescription>This can’t be undone.</DialogDescription>
        </DialogHeader>

        {deleteError ? <div className="text-sm text-destructive">{deleteError}</div> : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={() => void handleDelete()} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


