import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

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
  is_shared_by_me: boolean
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
  sharedByUserId: string | null
  searchText: string
  searchTags: string[]
  tagMode: 'union' | 'intersection'
}

async function fetchPostsFiltered({
  limit,
  userId,
  userIds,
  sharedByUserId,
  searchText,
  searchTags,
  tagMode,
}: FetchPostsArgs): Promise<Post[]> {
  if (!userId && userIds && userIds.length === 0) return []

  const selectBase = `
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
  const select = sharedByUserId ? `${selectBase}, post_shares!inner(user_id)` : selectBase

  let query = supabase
    .from('posts')
    .select(select)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (sharedByUserId) {
    query = query.eq('post_shares.user_id', sharedByUserId)
    // Sharing your own posts is not supported; exclude self-authored posts from "shared" feed
    query = query.neq('user_id', sharedByUserId)
  }

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
    is_shared_by_me: false,
  }))
}

type PostShareRow = {
  post_id: string
}

async function fetchSharedPostIds(viewerUserId: string, postIds: string[]): Promise<Set<string>> {
  if (postIds.length === 0) return new Set()
  const { data, error } = await supabase
    .from('post_shares')
    .select('post_id')
    .eq('user_id', viewerUserId)
    .in('post_id', postIds)

  if (error) throw error
  const rows = (data ?? []) as PostShareRow[]
  return new Set(rows.map((r) => r.post_id))
}

export function usePosts(options?: {
  limit?: number
  userId?: string | null
  userIds?: string[] | null
  sharedByUserId?: string | null
  refreshKey?: number
  searchText?: string
  searchTags?: string[]
  tagMode?: 'union' | 'intersection'
  viewerUserId?: string | null
}): UsePostsResult {
  const limit = options?.limit ?? 50
  const userId = options?.userId ?? null
  const userIds = useMemo(() => {
    const ids = options?.userIds ?? null
    if (!ids) return null
    return Array.from(new Set(ids.filter(Boolean)))
  }, [options?.userIds])
  const sharedByUserId = options?.sharedByUserId ?? null
  const refreshKey = options?.refreshKey
  const searchText = options?.searchText?.trim() ?? ''
  const searchTags = useMemo(
    () => (options?.searchTags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean),
    [options?.searchTags]
  )
  const searchTagsKey = useMemo(() => searchTags.join('|'), [searchTags])
  const tagMode = options?.tagMode ?? 'union'
  const viewerUserId = options?.viewerUserId ?? null

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    setLoading(true)
    setError(null)
    const p = await fetchPostsFiltered({ limit, userId, userIds, sharedByUserId, searchText, searchTags, tagMode })
    const ids = p.map((x) => x.id)
    if (viewerUserId) {
      const shared = await fetchSharedPostIds(viewerUserId, ids)
      setPosts(p.map((post) => ({ ...post, is_shared_by_me: shared.has(post.id) })))
    } else {
      setPosts(p)
    }
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false

    async function safeRun() {
      try {
        const p = await fetchPostsFiltered({ limit, userId, userIds, sharedByUserId, searchText, searchTags, tagMode })
        const ids = p.map((x) => x.id)
        if (viewerUserId) {
          const shared = await fetchSharedPostIds(viewerUserId, ids)
          const withShared = p.map((post) => ({ ...post, is_shared_by_me: shared.has(post.id) }))
          if (cancelled) return
          setPosts(withShared)
        } else {
        if (cancelled) return
        setPosts(p)
        }
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
  }, [limit, userId, userIds, sharedByUserId, refreshKey, searchText, searchTags, searchTagsKey, tagMode, viewerUserId])

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



