import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type UserProfile = {
  id: string
  name: string | null
  description: string | null
  profile_picture_url: string | null
}

type UseProfileResult = {
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, name, description, profile_picture_url')
    .eq('id', userId)
    .single()

  const errorCode =
    error && typeof error === 'object' && 'code' in error ? (error as { code?: string }).code : undefined

  if (errorCode === 'PGRST116') {
    // Profile doesn't exist - return null
    return null
  }

  if (error) throw error
  return data
}

export function useProfile(userId: string | null | undefined): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!userId) {
        setProfile(null)
        setLoading(false)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const p = await fetchProfile(userId)
        if (!cancelled) setProfile(p)
      } catch (e: unknown) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load profile')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [userId])

  return { profile, loading, error }
}


