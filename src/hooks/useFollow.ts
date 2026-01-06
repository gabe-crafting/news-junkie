import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type UseFollowResult = {
  isFollowing: boolean
  loading: boolean
  error: string | null
  toggle: () => Promise<void>
  refetch: () => Promise<void>
}

type FollowRow = {
  id: string
}

async function fetchFollowRowId(currentUserId: string, targetUserId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('followers')
    .select('id')
    .eq('follower_id', currentUserId)
    .eq('user_id', targetUserId)
    .maybeSingle()

  if (error) throw error
  const row = data as FollowRow | null
  return row?.id ?? null
}

export function useFollow(
  currentUserId: string | null | undefined,
  targetUserId: string | null | undefined
): UseFollowResult {
  const [rowId, setRowId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      setRowId(null)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const id = await fetchFollowRowId(currentUserId, targetUserId)
      setRowId(id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load follow status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, targetUserId])

  const toggle = async () => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) return

    const wasFollowing = !!rowId
    // optimistic
    setRowId(wasFollowing ? null : 'optimistic')

    try {
      if (wasFollowing) {
        const { error: deleteErr } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('user_id', targetUserId)
        if (deleteErr) throw deleteErr
        setRowId(null)
      } else {
        const { data, error: insertErr } = await supabase
          .from('followers')
          .insert({ user_id: targetUserId, follower_id: currentUserId })
          .select('id')
          .single()
        if (insertErr) throw insertErr
        const created = data as FollowRow
        setRowId(created.id)
      }
    } catch (e: unknown) {
      setRowId(wasFollowing ? rowId : null)
      setError(e instanceof Error ? e.message : 'Failed to update follow')
    }
  }

  const refetch = async () => {
    await run()
  }

  return { isFollowing: !!rowId && rowId !== 'optimistic', loading, error, toggle, refetch }
}


