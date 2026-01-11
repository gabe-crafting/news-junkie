import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
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
import { isValidTag, useUpdatePost } from '@/hooks/usePostMutations'

type PostEditDialogProps = {
  post: Post
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PostEditDialog({ post, open, onOpenChange }: PostEditDialogProps) {
  const { updatePost, loading: saving, error: editError, resetError: resetEditError } = useUpdatePost()

  const [editDescription, setEditDescription] = useState(post.description)
  const [editNewsLink, setEditNewsLink] = useState(post.news_link)
  const [shouldArchive, setShouldArchive] = useState(false)
  const [editTagInput, setEditTagInput] = useState('')
  const [editTags, setEditTags] = useState<string[]>(post.tags)
  const [tagError, setTagError] = useState<string | null>(null)
  const hasArchiveLink = !!post.archive_link?.trim()

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      resetEditError()
      setTagError(null)
      setEditDescription(post.description)
      setEditNewsLink(post.news_link)
      setShouldArchive(false)
      setEditTags(post.tags)
      setEditTagInput('')
    }
    onOpenChange(nextOpen)
  }

  const addTag = (raw: string) => {
    const next = raw.trim().toLowerCase()
    if (!next) return
    if (!isValidTag(next)) {
      setTagError('Tags must be a single lowercase word with no special characters.')
      return
    }
    setEditTags((prev) => (prev.includes(next) ? prev : [...prev, next]))
    setEditTagInput('')
    setTagError(null)
  }

  const removeTag = (tag: string) => {
    setEditTags((prev) => prev.filter((t) => t !== tag))
  }

  const onTagKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(editTagInput)
    }
  }

  const handleSave = async () => {
    setTagError(null)
    const ok = await updatePost(post.id, {
      description: editDescription,
      newsLink: editNewsLink,
      tags: editTags,
      shouldArchive: !hasArchiveLink ? shouldArchive : undefined,
    })
    if (ok) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
          <DialogDescription>Update the description, link, and tags.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`edit-description-${post.id}`}>
              Description
            </label>
            <Textarea
              id={`edit-description-${post.id}`}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`edit-link-${post.id}`}>
              Link
            </label>
            <Input
              id={`edit-link-${post.id}`}
              value={editNewsLink}
              onChange={(e) => setEditNewsLink(e.target.value)}
              disabled={saving}
            />

            {!hasArchiveLink ? (
              <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">Archive link</div>
                  <div className="text-xs text-muted-foreground">
                    Save this page to the Internet Archive and attach the Wayback link.
                  </div>
                </div>
                <Switch
                  checked={shouldArchive}
                  onCheckedChange={setShouldArchive}
                  disabled={saving || !editNewsLink.trim()}
                  aria-label="Archive this link"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`edit-tags-${post.id}`}>
              Tags
            </label>
            <Input
              id={`edit-tags-${post.id}`}
              value={editTagInput}
              onChange={(e) => {
                resetEditError()
                setTagError(null)
                setEditTagInput(e.target.value)
              }}
              onKeyDown={onTagKeyDown}
              placeholder="type a tag and press Enter"
              disabled={saving}
            />

            {editTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {editTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      className="ml-1 inline-flex items-center justify-center"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      disabled={saving}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : null}

            {tagError ? <div className="text-sm text-destructive">{tagError}</div> : null}
          </div>

          {editError ? <div className="text-sm text-destructive">{editError}</div> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


