import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

export function ProfilePage() {
  const { user } = useAuth()
  const userId = user?.id
  const { profile, loading, error } = useProfile(userId)

  if (loading) {
    return <div className="text-muted-foreground">Loading profile...</div>
  }

  if (error) {
    return <div className="text-destructive">Error loading profile: {error}</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Profile Picture Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Profile Picture</h2>

          <div className="flex flex-col items-center space-y-4">
            <div className="h-32 w-32 overflow-hidden rounded-full border-2 border-border bg-muted">
              {profile?.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  No photo yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Profile Information</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="rounded-md bg-muted p-2 text-sm">{user?.email || 'Not available'}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <div className="rounded-md bg-muted p-2 text-sm">{profile?.name || 'No name yet'}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <div className="min-h-[80px] rounded-md bg-muted p-2 text-sm">
                {profile?.description || 'No description yet'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
