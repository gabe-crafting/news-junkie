import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Post, PostAuthor } from '@/hooks/usePosts'
import { onPostDeleted, onPostUpdated } from '@/lib/postEvents'

type Cursor = {
  created_at: string
  id: string
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

type FetchPostsPageArgs = {
  pageSize: number
  cursor: Cursor | null
  userId: string | null
  userIds: string[] | null
  searchText: string
  searchTags: string[]
  tagMode: 'union' | 'intersection'
}

async function fetchPostsPage({
  pageSize,
  cursor,
  userId,
  userIds,
  searchText,
  searchTags,
  tagMode,
}: FetchPostsPageArgs): Promise<Post[]> {
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
    .order('id', { ascending: false })
    .limit(pageSize)

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
    query =
      tagMode === 'intersection'
        ? query.contains('tags', searchTags)
        : query.overlaps('tags', searchTags)
  }

  // Cursor pagination: order by created_at desc, id desc.
  // Next page condition:
  //   created_at < cursor.created_at
  //   OR (created_at = cursor.created_at AND id < cursor.id)
  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`
    )
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

export type UseInfinitePostsResult = {
  posts: Post[]
  initialLoading: boolean
  loadingMore: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refetch: () => Promise<void>
}

export function useInfinitePosts(options?: {
  pageSize?: number
  userId?: string | null
  userIds?: string[] | null
  refreshKey?: number
  searchText?: string
  searchTags?: string[]
  tagMode?: 'union' | 'intersection'
}): UseInfinitePostsResult {
  const pageSize = options?.pageSize ?? 30
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
  const tagMode = options?.tagMode ?? 'union'

  const optionsKey = useMemo(() => {
    const idsKey = userIds ? userIds.join('|') : ''
    const tagsKey = searchTags.join('|')
    return JSON.stringify({
      pageSize,
      userId,
      idsKey,
      refreshKey,
      searchText,
      tagsKey,
      tagMode,
    })
  }, [pageSize, refreshKey, searchText, searchTags, tagMode, userId, userIds])

  const [posts, setPosts] = useState<Post[]>([])
  const [cursor, setCursor] = useState<Cursor | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestSeq = useRef(0)

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

  const loadFirstPage = async (seq: number) => {
    setInitialLoading(true)
    setError(null)
    setHasMore(true)
    setCursor(null)
    setPosts([])

    try {
      const page = await fetchPostsPage({
        pageSize,
        cursor: null,
        userId,
        userIds,
        searchText,
        searchTags,
        tagMode,
      })

      if (requestSeq.current !== seq) return

      setPosts(page)
      const last = page[page.length - 1]
      setCursor(last ? { created_at: last.created_at, id: last.id } : null)
      setHasMore(page.length === pageSize)
    } catch (e: unknown) {
      if (requestSeq.current !== seq) return
      setError(e instanceof Error ? e.message : 'Failed to load posts')
      setHasMore(false)
    } finally {
      if (requestSeq.current === seq) setInitialLoading(false)
    }
  }

  const loadMore = async () => {
    if (initialLoading || loadingMore || !hasMore) return
    if (!cursor) {
      // No cursor means no results yet; treat as "no more".
      setHasMore(false)
      return
    }

    setLoadingMore(true)
    setError(null)

    const seq = ++requestSeq.current
    try {
      const page = await fetchPostsPage({
        pageSize,
        cursor,
        userId,
        userIds,
        searchText,
        searchTags,
        tagMode,
      })

      if (requestSeq.current !== seq) return

      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        const next = page.filter((p) => !seen.has(p.id))
        return [...prev, ...next]
      })

      const last = page[page.length - 1]
      setCursor(last ? { created_at: last.created_at, id: last.id } : cursor)
      setHasMore(page.length === pageSize)
    } catch (e: unknown) {
      if (requestSeq.current !== seq) return
      setError(e instanceof Error ? e.message : 'Failed to load more posts')
    } finally {
      if (requestSeq.current === seq) setLoadingMore(false)
    }
  }

  const refetch = async () => {
    const seq = ++requestSeq.current
    await loadFirstPage(seq)
  }

  useEffect(() => {
    const seq = ++requestSeq.current
    void loadFirstPage(seq)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsKey])

  return { posts, initialLoading, loadingMore, error, hasMore, loadMore, refetch }
}

