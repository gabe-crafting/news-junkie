import { useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'

function formatShortId(id: string | null | undefined): string {
  if (!id) return ''
  if (id.length <= 12) return id
  return `${id.slice(0, 8)}…${id.slice(-4)}`
}

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  useAuth()
  const { profile, loading, error } = useProfile(userId)

  const name = profile?.name?.trim() || 'Unnamed'
  const fallback = name.slice(0, 1).toUpperCase() || '?'
  const shortId = formatShortId(userId)

  const handleCopyId = async () => {
    if (!userId) return
    try {
      if (!('clipboard' in navigator)) return
      await navigator.clipboard.writeText(userId)
    } catch {
      // no-op: clipboard permissions can fail depending on browser context
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading profile...</div>
  }

  if (error) {
    return <div className="text-destructive">Error loading profile: {error}</div>
  }

  return (
    <div className="space-y-4">
      {/* Minimal “Twitter-like” header */}
      <div className="relative">
        <div className="h-28 w-full rounded-md bg-muted" />

        <div className="px-2">
          <div className="-mt-10 flex items-start justify-between gap-6">
            <div className="flex flex-col items-start min-w-0">
              <Avatar className="size-20 border-4 border-background">
                {profile?.profile_picture_url ? (
                  <AvatarImage src={profile.profile_picture_url} alt={name} />
                ) : null}
                <AvatarFallback>{fallback}</AvatarFallback>
              </Avatar>

              <div className="mt-3 min-w-0">
                <div className="text-2xl font-bold leading-tight">{name}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-6"
                    onClick={() => void handleCopyId()}
                    aria-label="Copy user id"
                    title="Copy user id"
                    disabled={!userId}
                  >
                    <Copy className="size-3" />
                  </Button>
                  <span className="font-mono truncate">@{shortId}</span>
                </div>
              </div>
            </div>

            <div className="mt-12 hidden sm:block min-w-0 flex-1 border-l border-border pl-6 text-sm text-muted-foreground whitespace-pre-wrap">
              {profile?.description || 'No description yet'}
            </div>
          </div>
        </div>
      </div>

      <div className="sm:hidden whitespace-pre-wrap text-sm text-muted-foreground">
        {profile?.description || 'No description yet'}
      </div>
    </div>
  )
}
