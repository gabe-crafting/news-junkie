import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export type CreatePostInput = {
  description: string
  newsLink: string
  tags: string[]
  shouldArchive?: boolean
}

export type UpdatePostInput = {
  description: string
  newsLink: string
  tags: string[]
  shouldArchive?: boolean
}

export function isValidTag(tag: string): boolean {
  // one "word", lowercase, no special characters
  return /^[a-z0-9]+$/.test(tag)
}

function normalizeTags(tags: string[]): string[] {
  return tags.map((t) => t.trim().toLowerCase()).filter(Boolean)
}

function validateUrl(url: string): string | null {
  try {
    new URL(url)
    return null
  } catch {
    return 'Please enter a valid URL.'
  }
}

function validatePostInput(input: CreatePostInput): {
  normalized: CreatePostInput
  error: string | null
} {
  const description = input.description.trim()
  const newsLink = input.newsLink.trim()
  const tags = normalizeTags(input.tags)

  if (!description || !newsLink) {
    return { normalized: { description, newsLink, tags }, error: 'Description and link are required.' }
  }

  const urlError = validateUrl(newsLink)
  if (urlError) return { normalized: { description, newsLink, tags }, error: urlError }

  const invalid = tags.find((t) => !isValidTag(t))
  if (invalid) {
    return {
      normalized: { description, newsLink, tags },
      error: 'Tags must be a single lowercase word with no special characters.',
    }
  }

  return { normalized: { description, newsLink, tags }, error: null }
}

type MutationResult = {
  loading: boolean
  error: string | null
  resetError: () => void
}

export function useCreatePost(): MutationResult & {
  createPost: (input: CreatePostInput) => Promise<boolean>
} {
  const { user, bumpPostsRefreshKey } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPost = async (input: CreatePostInput): Promise<boolean> => {
    if (!user) return false
    setLoading(true)
    setError(null)

    const { normalized, error: validationError } = validatePostInput(input)
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return false
    }

    try {
      const { createArchiveLink } = await import('@/lib/archive')
      const archiveLink = input.shouldArchive ? await createArchiveLink(normalized.newsLink) : null

      const { error: insertErr } = await supabase.from('posts').insert({
        user_id: user.id,
        description: normalized.description,
        news_link: normalized.newsLink,
        archive_link: archiveLink,
        tags: normalized.tags,
      })

      if (insertErr) throw insertErr
      bumpPostsRefreshKey()
      return true
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create post')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { createPost, loading, error, resetError: () => setError(null) }
}

export function useUpdatePost(): MutationResult & {
  updatePost: (postId: string, input: UpdatePostInput) => Promise<boolean>
} {
  const { user, bumpPostsRefreshKey } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updatePost = async (postId: string, input: UpdatePostInput): Promise<boolean> => {
    if (!user) return false
    setLoading(true)
    setError(null)

    const { normalized, error: validationError } = validatePostInput(input)
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return false
    }

    try {
      const { createArchiveLink } = await import('@/lib/archive')
      const archiveLink = input.shouldArchive ? await createArchiveLink(normalized.newsLink) : null

      const updateData: {
        description: string
        news_link: string
        tags: string[]
        archive_link?: string
      } = {
        description: normalized.description,
        news_link: normalized.newsLink,
        tags: normalized.tags,
      }
      if (archiveLink) updateData.archive_link = archiveLink

      const { error: updateErr } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId)
        .eq('user_id', user.id)

      if (updateErr) throw updateErr
      bumpPostsRefreshKey()
      return true
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update post')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { updatePost, loading, error, resetError: () => setError(null) }
}

export function useDeletePost(): MutationResult & {
  deletePost: (postId: string) => Promise<boolean>
} {
  const { user, bumpPostsRefreshKey } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deletePost = async (postId: string): Promise<boolean> => {
    if (!user) return false
    setLoading(true)
    setError(null)
    try {
      const { error: deleteErr } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id)

      if (deleteErr) throw deleteErr
      bumpPostsRefreshKey()
      return true
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete post')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { deletePost, loading, error, resetError: () => setError(null) }
}


