import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useDiscoverPage } from '@/hooks/useDiscoverPage'
import { Link } from 'react-router-dom'

export function DiscoverPage() {
  const { items, loading, error, toggleFollow } = useDiscoverPage()

  return (
    <div className="space-y-4">
      <div className="text-2xl font-semibold">Discover Junkies</div>

      {loading ? (
        <div className="text-muted-foreground">Loading users...</div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-muted-foreground">No users found.</div>
      ) : (
        <div className="divide-y">
          {items.map((p) => {
            return (
              <div key={p.id} className="py-4 flex items-start gap-4">
                <Link to={p.href} className="shrink-0">
                  <Avatar className="size-12 cursor-pointer">
                    {p.profilePictureUrl ? (
                      <AvatarImage src={p.profilePictureUrl} alt={p.displayName} />
                    ) : null}
                    <AvatarFallback>{p.initials}</AvatarFallback>
                  </Avatar>
                </Link>

                <div className="min-w-0 flex-1">
                  <Link to={p.href} className="font-semibold truncate hover:underline">
                    {p.displayName}
                  </Link>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-2">
                    {p.description}
                  </div>
                </div>

                <Button
                  type="button"
                  variant={p.isFollowing ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => void toggleFollow(p.id)}
                >
                  {p.isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


