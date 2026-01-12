import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { onPostDeleted, onPostUpdated } from '@/lib/postEvents'

export type PostAuthor = {
  id: string
  name: string | null
  profile_picture_url: string | null
}

export type Post = {
  id: string
  user_id: string
  description: string
  news_link: string
  archive_link: string | null
  tags: string[]
  created_at: string
  author: PostAuthor | null
}

type UsePostsResult = {
  posts: Post[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

type PostsSelectRow = {
  id: string
  user_id: string
  description: string
  news_link: string
  archive_link: string | null
  tags: string[] | null
  created_at: string
  user_profiles: PostAuthor | PostAuthor[] | null
}

function normalizeAuthor(author: PostsSelectRow['user_profiles']): PostAuthor | null {
  if (!author) return null
  if (Array.isArray(author)) return author[0] ?? null
  return author
}

type FetchPostsArgs = {
  limit: number
  userId: string | null
  userIds: string[] | null
  searchText: string
  searchTags: string[]
  tagMode: 'union' | 'intersection'
}

async function fetchPostsFiltered({
  limit,
  userId,
  userIds,
  searchText,
  searchTags,
  tagMode,
}: FetchPostsArgs): Promise<Post[]> {
  if (!userId && userIds && userIds.length === 0) return []

  let query = supabase
    .from('posts')
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
    .order('created_at', { ascending: false })
    .limit(limit)

  if (userId) {
    query = query.eq('user_id', userId)
  } else if (userIds && userIds.length > 0) {
    query = query.in('user_id', userIds)
  }

  if (searchText) {
    const q = `%${searchText}%`
    query = query.or(`description.ilike.${q},news_link.ilike.${q}`)
  }

  if (searchTags.length > 0) {
    query = tagMode === 'intersection'
      ? query.contains('tags', searchTags)
      : query.overlaps('tags', searchTags)
  }

  const { data, error } = await query

  if (error) throw error

  const rows = (data ?? []) as unknown as PostsSelectRow[]
  return rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    description: row.description,
    news_link: row.news_link,
    archive_link: row.archive_link,
    tags: row.tags ?? [],
    created_at: row.created_at,
    author: normalizeAuthor(row.user_profiles),
  }))
}

export function usePosts(options?: {
  limit?: number
  userId?: string | null
  userIds?: string[] | null
  refreshKey?: number
  searchText?: string
  searchTags?: string[]
  tagMode?: 'union' | 'intersection'
}): UsePostsResult {
  const limit = options?.limit ?? 50
  const userId = options?.userId ?? null
  const userIds = useMemo(() => {
    const ids = options?.userIds ?? null
    if (!ids) return null
    return Array.from(new Set(ids.filter(Boolean)))
  }, [options?.userIds])
  const refreshKey = options?.refreshKey
  const searchText = options?.searchText?.trim() ?? ''
  const searchTags = useMemo(
    () => (options?.searchTags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean),
    [options?.searchTags]
  )
  const searchTagsKey = useMemo(() => searchTags.join('|'), [searchTags])
  const tagMode = options?.tagMode ?? 'union'

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubs = [
      onPostUpdated((updated) => {
        setPosts((prev) => {
          const idx = prev.findIndex((p) => p.id === updated.id)
          if (idx === -1) return prev
          const next = prev.slice()
          next[idx] = updated
          return next
        })
      }),
      onPostDeleted((postId) => {
        setPosts((prev) => prev.filter((p) => p.id !== postId))
      }),
    ]
    return () => {
      for (const unsub of unsubs) unsub()
    }
  }, [])

  const run = async () => {
    setLoading(true)
    setError(null)
    const p = await fetchPostsFiltered({ limit, userId, userIds, searchText, searchTags, tagMode })
    setPosts(p)
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false

    async function safeRun() {
      try {
        const p = await fetchPostsFiltered({ limit, userId, userIds, searchText, searchTags, tagMode })
        if (cancelled) return
        setPosts(p)
      } catch (e: unknown) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load posts')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    setLoading(true)
    setError(null)
    void safeRun()

    return () => {
      cancelled = true
    }
  }, [limit, userId, userIds, refreshKey, searchText, searchTags, searchTagsKey, tagMode])

  const refetch = async () => {
    try {
      await run()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load posts')
      setLoading(false)
    }
  }

  return { posts, loading, error, refetch }
}



