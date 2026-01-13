import { useEffect, useRef } from 'react'
import type { Post } from '@/hooks/usePosts'
import { PostCard } from '@/components/organisms/PostCard'
import { LoadingPosts } from '@/components/LoadingPosts'

type BaseProps = {
  posts: Post[]
  loading: boolean
  error: string | null
  emptyText?: string
}

type InfiniteProps = {
  infinite: true
  hasMore: boolean
  loadingMore: boolean
  loadMore: () => void | Promise<void>
  loadingMoreText?: string
  endText?: string
  rootMargin?: string
}

type NonInfiniteProps = {
  infinite?: false
}

export type PostsListProps = BaseProps & (InfiniteProps | NonInfiniteProps)

export function PostsList(props: PostsListProps) {
  const {
    posts,
    loading,
    error,
    emptyText = 'No posts yet.',
  } = props

  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const isInfinite = props.infinite === true

  let hasMore: boolean | undefined
  let loadingMore: boolean | undefined
  let loadMore: (() => void | Promise<void>) | undefined
  let rootMargin: string | undefined

  if (isInfinite) {
    hasMore = props.hasMore
    loadingMore = props.loadingMore
    loadMore = props.loadMore
    rootMargin = props.rootMargin
  }

  useEffect(() => {
    if (!isInfinite) return

    const el = loadMoreRef.current
    if (!el) return
    if (!hasMore) return
    if (loading || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (!first?.isIntersecting) return
        if (loading || loadingMore) return
        void loadMore?.()
      },
      {
        root: null,
        rootMargin: rootMargin ?? '400px',
        threshold: 0,
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [
    isInfinite,
    loading,
    hasMore,
    loadingMore,
    loadMore,
    rootMargin,
  ])

  if (loading) return <LoadingPosts />
  if (error) return <div className="text-destructive">{error}</div>
  if (posts.length === 0) return <div className="text-muted-foreground">{emptyText}</div>

  const loadingMoreText = isInfinite ? (props.loadingMoreText ?? 'Loading more...') : null
  const endText = isInfinite ? (props.endText ?? 'You’re all caught up.') : null

  return (
    <div className="space-y-0">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {isInfinite ? (
        <>
          <div ref={loadMoreRef} className="h-1" />

          {loadingMore ? (
            <LoadingPosts className="py-4" text={loadingMoreText ?? undefined} />
          ) : !hasMore ? (
            <div className="py-4 text-muted-foreground">{endText}</div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

