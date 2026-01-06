import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useDiscoverJunkies } from '@/hooks/useDiscoverJunkies'

type DiscoverPageItem = {
  id: string
  href: string
  displayName: string
  initials: string
  description: string
  profilePictureUrl: string | null
  isFollowing: boolean
}

type UseDiscoverPageResult = {
  items: DiscoverPageItem[]
  loading: boolean
  error: string | null
  toggleFollow: (targetUserId: string) => Promise<void>
}

function computeInitials(name: string | null): string {
  const n = (name ?? '').trim()
  if (!n) return '?'
  return n.slice(0, 1).toUpperCase()
}

export function useDiscoverPage(): UseDiscoverPageResult {
  const { user } = useAuth()
  const { junkies, loading, error, toggleFollow } = useDiscoverJunkies(user?.id)

  const items = useMemo<DiscoverPageItem[]>(() => {
    return junkies.map((p) => {
      const displayName = p.name?.trim() || 'Unnamed'
      return {
        id: p.id,
        href: `/app/profile/${p.id}`,
        displayName,
        initials: computeInitials(p.name),
        description: p.description ?? '',
        profilePictureUrl: p.profile_picture_url,
        isFollowing: p.isFollowing,
      }
    })
  }, [junkies])

  return { items, loading, error, toggleFollow }
}


