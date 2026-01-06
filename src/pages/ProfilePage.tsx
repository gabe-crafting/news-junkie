import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { usePosts } from '@/hooks/usePosts'
import { useFollow } from '@/hooks/useFollow'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, Copy, Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { Textarea } from '@/components/ui/textarea'
import { PostSearchCollapsible, type TagMode } from '@/components/PostSearchCollapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PostCard } from '@/components/PostCard'

function formatShortId(id: string | null | undefined): string {
  if (!id) return ''
  if (id.length <= 12) return id
  return `${id.slice(0, 8)}…${id.slice(-4)}`
}

function extractStoragePathFromProfilePictureUrl(
  url: string,
  bucket: string
): string | null {
  const u = url.split('?')[0] ?? ''
  const publicMarker = `/storage/v1/object/public/${bucket}/`
  const signedMarker = `/storage/v1/object/sign/${bucket}/`
  if (u.includes(publicMarker)) return u.split(publicMarker)[1] ?? null
  if (u.includes(signedMarker)) return u.split(signedMarker)[1] ?? null
  return null
}

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user, loading: authLoading, profileRefreshKey, bumpProfileRefreshKey, postsRefreshKey } = useAuth()
  const { profile, loading, error } = useProfile(userId, profileRefreshKey)
  const { isFollowing, loading: followLoading, toggle: toggleFollow } = useFollow(user?.id, userId)
  const [postSearch, setPostSearch] = useState<{ text: string; tags: string[]; tagMode: TagMode }>({
    text: '',
    tags: [],
    tagMode: 'union',
  })

  const {
    posts: userPosts,
    loading: postsLoading,
    error: postsError,
  } = usePosts({
    limit: 50,
    userId,
    refreshKey: postsRefreshKey,
    searchText: postSearch.text,
    searchTags: postSearch.tags,
    tagMode: postSearch.tagMode,
  })
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [photoOverrideUrl, setPhotoOverrideUrl] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const name = profile?.name?.trim() || 'Unnamed'
  const fallback = name.slice(0, 1).toUpperCase() || '?'
  const shortId = formatShortId(userId)
  const photoUrl = photoOverrideUrl ?? profile?.profile_picture_url ?? null
  const isOwnProfile = !!userId && !!user && user.id === userId
  const description = profile?.description ?? ''
  const canFollow = !!user?.id && !!userId && user.id !== userId

  const handleCopyId = async () => {
    if (!userId) return
    try {
      if (!('clipboard' in navigator)) return
      await navigator.clipboard.writeText(userId)
    } catch {
      // no-op: clipboard permissions can fail depending on browser context
    }
  }

  const handlePickPhoto = () => {
    if (!isOwnProfile || uploading) return
    fileInputRef.current?.click()
  }

  const openEdit = () => {
    if (!isOwnProfile) return
    setSaveError(null)
    setEditName(profile?.name ?? '')
    setEditDescription(profile?.description ?? '')
    setEditOpen(true)
  }

  const handleSaveProfile = async () => {
    if (!isOwnProfile || !userId) return
    setSaving(true)
    setSaveError(null)

    try {
      const nextName = editName.trim()
      const nextDescription = editDescription.trim()

      const { error: upsertErr } = await supabase
        .from('user_profiles')
        .upsert(
          {
            id: userId,
            name: nextName.length ? nextName : null,
            description: nextDescription.length ? nextDescription : null,
          },
          { onConflict: 'id' }
        )

      if (upsertErr) throw upsertErr

      bumpProfileRefreshKey()
      setEditOpen(false)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleFileSelected = async (file: File | null) => {
    if (!file || !isOwnProfile || !userId) return
    setUploadError(null)

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.')
      return
    }

    // 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image is too large (max 5MB).')
      return
    }

    const bucket = 'profile-pictures'
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const uuid = crypto.randomUUID()
    const path = `${userId}/${uuid}-${safeName}`
    const oldUrl = profile?.profile_picture_url ?? null
    const oldPath =
      oldUrl ? extractStoragePathFromProfilePictureUrl(oldUrl, bucket) : null

    setUploading(true)
    try {
      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadErr) throw uploadErr

      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      const publicUrl = data.publicUrl

      const { error: upsertErr } = await supabase
        .from('user_profiles')
        .upsert(
          { id: userId, profile_picture_url: publicUrl },
          { onConflict: 'id' }
        )

      if (upsertErr) {
        // cleanup newly uploaded file if db write fails
        await supabase.storage.from(bucket).remove([path])
        throw upsertErr
      }

      setPhotoOverrideUrl(publicUrl)
      bumpProfileRefreshKey()

      if (oldPath && oldPath.startsWith(`${userId}/`) && oldPath !== path) {
        await supabase.storage.from(bucket).remove([oldPath])
      }
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  if (authLoading || (loading && !profile)) {
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
              <div className="relative group">
                <Avatar className="size-20 border-4 border-background">
                  {photoUrl ? (
                    <AvatarImage src={photoUrl} alt={name} />
                  ) : null}
                  <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>

                {isOwnProfile ? (
                  <>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => void handleFileSelected(e.currentTarget.files?.[0] ?? null)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute inset-0 h-full w-full p-0 rounded-full bg-background/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 flex items-center justify-center cursor-pointer"
                      onClick={handlePickPhoto}
                      disabled={uploading}
                      aria-label="Change profile photo"
                      title="Change profile photo"
                    >
                      <Camera className="size-4" />
                    </Button>
                  </>
                ) : null}
              </div>

              <div className="mt-3 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold leading-tight">{name}</div>
                  {canFollow ? (
                    <Button
                      type="button"
                      size="sm"
                      variant={isFollowing ? 'outline' : 'default'}
                      onClick={() => void toggleFollow()}
                      disabled={followLoading}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  ) : null}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {isOwnProfile ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-6"
                      onClick={openEdit}
                      aria-label="Edit profile"
                      title="Edit profile"
                    >
                      <Pencil className="size-3" />
                    </Button>
                  ) : null}

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

                {uploadError ? (
                  <div className="mt-2 text-sm text-destructive">{uploadError}</div>
                ) : null}
              </div>
            </div>

            <div className="mt-12 hidden sm:block min-w-0 flex-1 border-l border-border pl-6 text-sm text-muted-foreground whitespace-pre-wrap">
              {description || 'No description yet'}
            </div>
          </div>
        </div>
      </div>

      <div className="sm:hidden whitespace-pre-wrap text-sm text-muted-foreground">
        {description || 'No description yet'}
      </div>

      <div className="pt-2">
        <PostSearchCollapsible
          title="Search posts"
          value={postSearch}
          onSearch={async (next) => {
            setPostSearch(next)
            // Track tags as "usually viewed"
            if (user && next.tags.length > 0) {
              await Promise.all(
                next.tags.map((tag) =>
                  supabase.rpc('add_usually_viewed_tag', { p_user_id: user.id, p_tag: tag })
                )
              )
              bumpProfileRefreshKey()
            }
          }}
          onClear={() => setPostSearch({ text: '', tags: [], tagMode: 'union' })}
        />

        {postsLoading ? (
          <div className="text-muted-foreground">Loading posts...</div>
        ) : postsError ? (
          <div className="text-destructive">{postsError}</div>
        ) : userPosts.length === 0 ? (
          <div className="text-muted-foreground">No posts yet.</div>
        ) : (
          <div className="space-y-0">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Update your name and description.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="profile-name">
                Name
              </label>
              <Input
                id="profile-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="profile-description">
                Description
              </label>
              <Textarea
                id="profile-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Tell people what you’re into"
                disabled={saving}
              />
            </div>

            {saveError ? (
              <div className="text-sm text-destructive">{saveError}</div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSaveProfile()} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
