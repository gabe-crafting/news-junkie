import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

type UsePostShareResult = {
  shared: boolean
  loading: boolean
  error: string | null
  toggle: () => Promise<void>
}

export function usePostShare(postId: string, initialShared: boolean): UsePostShareResult {
  const { user } = useAuth()
  const [shared, setShared] = useState(initialShared)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setShared(initialShared)
  }, [initialShared, postId])

  const toggle = async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    const wasShared = shared
    setShared(!wasShared)

    try {
      if (wasShared) {
        const { error: deleteErr } = await supabase
          .from('post_shares')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)
        if (deleteErr) throw deleteErr
      } else {
        const { error: insertErr } = await supabase
          .from('post_shares')
          .insert({ user_id: user.id, post_id: postId })
        if (insertErr) throw insertErr
      }
    } catch (e: unknown) {
      setShared(wasShared)
      setError(e instanceof Error ? e.message : 'Failed to update share')
    } finally {
      setLoading(false)
    }
  }

  return { shared, loading, error, toggle }
}


