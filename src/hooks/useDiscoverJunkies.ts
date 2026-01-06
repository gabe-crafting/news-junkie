import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type JunkieProfile = {
  id: string
  name: string | null
  description: string | null
  profile_picture_url: string | null
}

export type DiscoverJunkie = JunkieProfile & {
  isFollowing: boolean
}

type UseDiscoverJunkiesResult = {
  junkies: DiscoverJunkie[]
  loading: boolean
  error: string | null
  toggleFollow: (targetUserId: string) => Promise<void>
  refetch: () => Promise<void>
}

type FollowersRow = {
  user_id: string
}

async function fetchProfiles(): Promise<JunkieProfile[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, name, description, profile_picture_url')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as JunkieProfile[]
}

async function fetchFollowingIds(currentUserId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('followers')
    .select('user_id')
    .eq('follower_id', currentUserId)

  if (error) throw error
  const rows = (data ?? []) as FollowersRow[]
  return new Set(rows.map((r) => r.user_id))
}

export function useDiscoverJunkies(currentUserId: string | null | undefined): UseDiscoverJunkiesResult {
  const [profiles, setProfiles] = useState<JunkieProfile[]>([])
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    if (!currentUserId) {
      setProfiles([])
      setFollowingIds(new Set())
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const [p, f] = await Promise.all([
        fetchProfiles(),
        fetchFollowingIds(currentUserId),
      ])
      setProfiles(p)
      setFollowingIds(f)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

  const junkies = useMemo<DiscoverJunkie[]>(() => {
    const ids = followingIds
    return profiles
      .filter((p) => p.id !== currentUserId)
      .map((p) => ({
        ...p,
        isFollowing: ids.has(p.id),
      }))
  }, [currentUserId, followingIds, profiles])

  const toggleFollow = async (targetUserId: string) => {
    if (!currentUserId) return
    if (targetUserId === currentUserId) return

    const wasFollowing = followingIds.has(targetUserId)
    // optimistic update
    setFollowingIds((prev) => {
      const next = new Set(prev)
      if (wasFollowing) next.delete(targetUserId)
      else next.add(targetUserId)
      return next
    })

    try {
      if (wasFollowing) {
        const { error: deleteErr } = await supabase
          .from('followers')
          .delete()
          .eq('user_id', targetUserId)
          .eq('follower_id', currentUserId)
        if (deleteErr) throw deleteErr
      } else {
        const { error: insertErr } = await supabase
          .from('followers')
          .insert({ user_id: targetUserId, follower_id: currentUserId })
        if (insertErr) throw insertErr
      }
    } catch (e: unknown) {
      // rollback optimistic update
      setFollowingIds((prev) => {
        const next = new Set(prev)
        if (wasFollowing) next.add(targetUserId)
        else next.delete(targetUserId)
        return next
      })
      setError(e instanceof Error ? e.message : 'Failed to update follow')
    }
  }

  const refetch = async () => {
    await run()
  }

  return { junkies, loading, error, toggleFollow, refetch }
}


