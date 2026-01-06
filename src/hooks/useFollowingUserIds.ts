import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type UseFollowingUserIdsResult = {
  userIds: string[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

type Row = {
  user_id: string
}

async function fetchFollowingUserIds(currentUserId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('followers')
    .select('user_id')
    .eq('follower_id', currentUserId)

  if (error) throw error
  const rows = (data ?? []) as Row[]
  return rows.map((r) => r.user_id)
}

export function useFollowingUserIds(
  currentUserId: string | null | undefined,
  refreshKey?: number
): UseFollowingUserIdsResult {
  const [userIds, setUserIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    if (!currentUserId) {
      setUserIds([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const ids = await fetchFollowingUserIds(currentUserId)
      setUserIds(ids)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load following')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, refreshKey])

  const refetch = async () => {
    await run()
  }

  return { userIds, loading, error, refetch }
}


