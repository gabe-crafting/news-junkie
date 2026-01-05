import { useEffect, useState } from 'react'
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

async function fetchPosts(limit: number): Promise<Post[]> {
  const { data, error } = await supabase
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

export function usePosts(options?: { limit?: number }): UsePostsResult {
  const limit = options?.limit ?? 50

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    setLoading(true)
    setError(null)
    const p = await fetchPosts(limit)
    setPosts(p)
    setLoading(false)
  }

  useEffect(() => {
    let cancelled = false

    async function safeRun() {
      try {
        const p = await fetchPosts(limit)
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
  }, [limit])

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



