import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { emitPostDeleted, emitPostUpdated } from '@/lib/postEvents'
import type { Post, PostAuthor } from '@/hooks/usePosts'

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
  updatePost: (postId: string, input: UpdatePostInput) => Promise<Post | null>
} {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  type PostsUpdateRow = {
    id: string
    user_id: string
    description: string
    news_link: string
    archive_link: string | null
    tags: string[] | null
    created_at: string
    user_profiles: PostAuthor | PostAuthor[] | null
  }

  function normalizeAuthor(author: PostsUpdateRow['user_profiles']): PostAuthor | null {
    if (!author) return null
    if (Array.isArray(author)) return author[0] ?? null
    return author
  }

  const updatePost = async (postId: string, input: UpdatePostInput): Promise<Post | null> => {
    if (!user) return null
    setLoading(true)
    setError(null)

    const { normalized, error: validationError } = validatePostInput(input)
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return null
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

      const { data, error: updateErr } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId)
        .eq('user_id', user.id)
        .select(
          `
            id,
            user_id,
            description,
            news_link,
            archive_link,
            tags,
            created_at,
            user_profiles (
              id,
              name,
              profile_picture_url
            )
          `
        )
        .single()

      if (updateErr) throw updateErr

      const row = data as unknown as PostsUpdateRow
      const updated: Post = {
        id: row.id,
        user_id: row.user_id,
        description: row.description,
        news_link: row.news_link,
        archive_link: row.archive_link,
        tags: row.tags ?? [],
        created_at: row.created_at,
        author: normalizeAuthor(row.user_profiles),
      }

      emitPostUpdated(updated)
      return updated
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update post')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { updatePost, loading, error, resetError: () => setError(null) }
}

export function useDeletePost(): MutationResult & {
  deletePost: (postId: string) => Promise<boolean>
} {
  const { user } = useAuth()
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
      emitPostDeleted(postId)
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


