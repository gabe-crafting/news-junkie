import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type UseUsuallyViewedTagsResult = {
  tags: string[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

type Row = {
  usually_viewed_tags: string[] | null
}

async function fetchUsuallyViewedTags(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('usually_viewed_tags')
    .eq('id', userId)
    .single()

  if (error) throw error
  const row = data as Row
  return row.usually_viewed_tags ?? []
}

export function useUsuallyViewedTags(
  userId: string | null | undefined,
  refreshKey?: number
): UseUsuallyViewedTagsResult {
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    if (!userId) {
      setTags([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const t = await fetchUsuallyViewedTags(userId)
      setTags(t)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load tags')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, refreshKey])

  const refetch = async () => {
    await run()
  }

  return { tags, loading, error, refetch }
}


