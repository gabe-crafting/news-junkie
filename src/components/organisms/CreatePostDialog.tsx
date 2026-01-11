import { useMemo, useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCreatePost, isValidTag } from '@/hooks/usePostMutations'
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
  DialogTrigger,
} from '@/components/ui/dialog'

type CreatePostDialogProps = {
  triggerClassName?: string
  triggerVariant?: 'default' | 'fab'
}

export function CreatePostDialog({ triggerClassName, triggerVariant = 'default' }: CreatePostDialogProps) {
  const { user } = useAuth()
  const { createPost, loading: submitting, error, resetError } = useCreatePost()
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [newsLink, setNewsLink] = useState('')
  const [shouldArchive, setShouldArchive] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagError, setTagError] = useState<string | null>(null)

  const tagInputRef = useRef<HTMLInputElement | null>(null)

  const canSubmit = useMemo(() => {
    return !!user && description.trim().length > 0 && newsLink.trim().length > 0 && !submitting
  }, [description, newsLink, submitting, user])

  const addTag = (raw: string) => {
    const next = raw.trim().toLowerCase()
    if (!next) return
    if (!isValidTag(next)) {
      setTagError('Tags must be a single lowercase word with no special characters.')
      return
    }
    setTags((prev) => (prev.includes(next) ? prev : [...prev, next]))
    setTagInput('')
    setTagError(null)
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const onTagKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  const handleSubmit = async () => {
    if (!user) return
    setTagError(null)
    const ok = await createPost({ description, newsLink, tags, shouldArchive })
    if (ok) {
      setOpen(false)
      setDescription('')
      setNewsLink('')
      setShouldArchive(false)
      setTags([])
      setTagInput('')
    }
  }

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      resetError()
      setTagError(null)
      queueMicrotask(() => {
        tagInputRef.current?.blur()
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {triggerVariant === 'fab' ? (
          <Button
            className={triggerClassName}
            disabled={!user}
            size="icon"
            aria-label="Create post"
            title="Create post"
          >
            <Plus className="size-6" />
          </Button>
        ) : (
          <Button className={triggerClassName} disabled={!user}>
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create post</DialogTitle>
          <DialogDescription>Add a description, link, and tags.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="post-description">
              Description
            </label>
            <Textarea
              id="post-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What’s this about?"
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="post-link">
              Link
            </label>
            <Input
              id="post-link"
              value={newsLink}
              onChange={(e) => setNewsLink(e.target.value)}
              placeholder="https://example.com/article"
              disabled={submitting}
            />
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
                disabled={submitting || !newsLink.trim()}
                aria-label="Archive this link"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="post-tags">
              Tags
            </label>
            <Input
              id="post-tags"
              ref={tagInputRef}
              value={tagInput}
              onChange={(e) => {
                resetError()
                setTagError(null)
                setTagInput(e.target.value)
              }}
              onKeyDown={onTagKeyDown}
              placeholder="type a tag and press Enter"
              disabled={submitting}
            />

            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      className="ml-1 inline-flex items-center justify-center"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      disabled={submitting}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>

          {tagError ? <div className="text-sm text-destructive">{tagError}</div> : null}
          {error ? <div className="text-sm text-destructive">{error}</div> : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={!canSubmit}>
            {submitting ? 'Posting...' : 'Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


