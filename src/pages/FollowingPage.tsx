export function FollowingPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Following</h1>
      <h2 className="text-2xl font-semibold">People You Follow</h2>
      <p className="text-muted-foreground">
        See posts and updates from people you follow.
      </p>
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Following: 0 people
        </p>
        <p className="text-muted-foreground">
          Recent posts from your following will appear here.
        </p>
      </div>
    </div>
  )
}
