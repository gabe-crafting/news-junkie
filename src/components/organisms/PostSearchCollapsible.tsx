import { useState } from 'react'
import { ChevronDown, Plus, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { isValidTag } from '@/hooks/usePostMutations'

export type TagMode = 'union' | 'intersection'

type PostSearchState = {
  text: string
  tags: string[]
  tagMode: TagMode
}

type PostSearchCollapsibleProps = {
  value: PostSearchState
  onSearch: (next: PostSearchState) => void | Promise<void>
  onClear: () => void
  title?: string
}

export function PostSearchCollapsible({
  value,
  onSearch,
  onClear,
  title = 'Search',
}: PostSearchCollapsibleProps) {
  const [open, setOpen] = useState(false)

  const [draftText, setDraftText] = useState('')
  const [draftTagInput, setDraftTagInput] = useState('')
  const [draftTags, setDraftTags] = useState<string[]>([])
  const [draftTagMode, setDraftTagMode] = useState<TagMode>('union')
  const [draftError, setDraftError] = useState<string | null>(null)

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

  const handleClear = () => {
    setDraftText('')
    setDraftTagInput('')
    setDraftTags([])
    setDraftTagMode('union')
    setDraftError(null)
    onClear()
  }

  const handleSearch = async () => {
    await onSearch({ text: draftText.trim(), tags: draftTags, tagMode: draftTagMode })
    setOpen(false)
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setDraftError(null)
          setDraftText(value.text)
          setDraftTags(value.tags)
          setDraftTagMode(value.tagMode)
          setDraftTagInput('')
        }
      }}
    >
      <CollapsibleTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-between">
          <span className="inline-flex items-center gap-2">
            <Search className="h-4 w-4" />
            {title}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-3">
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="post-search-text">
              Text
            </label>
            <Input
              id="post-search-text"
              placeholder="Search posts"
              value={draftText}
              onChange={(e) => {
                setDraftError(null)
                setDraftText(e.target.value)
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="post-search-tag">
              Tag
            </label>
            <div className="flex">
              <Input
                id="post-search-tag"
                placeholder="type a tag and press Enter"
                value={draftTagInput}
                onChange={(e) => {
                  setDraftError(null)
                  setDraftTagInput(e.target.value)
                }}
                onKeyDown={onDraftTagKeyDown}
                className="rounded-r-none"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-l-none border-l-0"
                ariaLabel="Add tag"
                onClick={() => addDraftTag(draftTagInput)}
              >
                <Plus className="size-4" />
              </Button>
            </div>

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
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Button type="button" onClick={() => void handleSearch()}>
                Search
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}


