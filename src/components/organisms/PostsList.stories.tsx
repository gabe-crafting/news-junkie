import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Post } from '@/hooks/usePosts'
import { AuthContext, type AuthContextType } from '@/contexts/auth-context'
import { PostsList } from '@/components/organisms/PostsList'

type AuthUser = NonNullable<AuthContextType['user']>

function makeAuth(userId: string | null): AuthContextType {
  return {
    user: userId ? ({ id: userId } as AuthUser) : null,
    session: null,
    loading: false,
    signOut: async () => {},
    profileRefreshKey: 0,
    bumpProfileRefreshKey: () => {},
    postsRefreshKey: 0,
    bumpPostsRefreshKey: () => {},
  }
}

function makeMockPosts(count: number): Post[] {
  const base = Date.now()
  const authors = [
    { id: 'author_1', name: 'Ada', profile_picture_url: null },
    { id: 'author_2', name: 'Linus', profile_picture_url: null },
    { id: 'author_3', name: 'Grace', profile_picture_url: null },
  ]
  const tagPool = [
    'ai',
    'policy',
    'security',
    'privacy',
    'science',
    'health',
    'finance',
    'climate',
    'space',
    'energy',
    'sports',
    'culture',
    'education',
    'gaming',
    'opensource',
    'hardware',
  ]

  return Array.from({ length: count }, (_, i) => {
    const author = authors[i % authors.length]!
    const created_at = new Date(base - i * 1000 * 60).toISOString()
    const tags = Array.from({ length: (i % 7) + 1 }, (_, t) => tagPool[(i + t) % tagPool.length]!)

    return {
      id: `mock_post_${i + 1}`,
      user_id: `user_${author.id}`,
      description:
        i % 12 === 0
          ? `Longer post #${i + 1} — used to test wrapping.\n\n` +
            `This one has multiple paragraphs and some extra text to make the card taller.\n\n` +
            `Notes:\n- line one\n- line two\n- line three`
          : `Mock post #${i + 1}: interesting link and a short note.`,
      news_link: `https://example.com/news/${i + 1}`,
      archive_link:
        i % 25 === 0
          ? `https://web.archive.org/web/20260101/https://example.com/news/${i + 1}`
          : null,
      tags,
      created_at,
      author,
    }
  })
}

function DynamicDemo(props: { total: number; pageSize: number }) {
  const allPosts = useMemo(() => makeMockPosts(props.total), [props.total])

  const [posts, setPosts] = useState<Post[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error] = useState<string | null>(null)

  const hasMore = posts.length < allPosts.length

  useEffect(() => {
    // Simulate initial fetch.
    setInitialLoading(true)
    const t = window.setTimeout(() => {
      setPosts(allPosts.slice(0, props.pageSize))
      setInitialLoading(false)
    }, 600)
    return () => window.clearTimeout(t)
  }, [allPosts, props.pageSize])

  const loadMore = useCallback(async () => {
    if (initialLoading || loadingMore) return
    if (!hasMore) return

    setLoadingMore(true)
    await new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), 500)
    })
    setPosts((prev) => allPosts.slice(0, Math.min(prev.length + props.pageSize, allPosts.length)))
    setLoadingMore(false)
  }, [allPosts, hasMore, initialLoading, loadingMore, props.pageSize])

  return (
    <div className="h-[70vh] overflow-auto rounded-md border border-border bg-background">
      <div className="p-4">
        <div className="mb-3 text-sm text-muted-foreground">
          Scroll to the bottom to trigger <span className="font-mono">loadMore()</span>.
        </div>
        <PostsList
          posts={posts}
          loading={initialLoading}
          error={error}
          infinite
          hasMore={hasMore}
          loadingMore={loadingMore}
          loadMore={loadMore}
        />
      </div>
    </div>
  )
}

const meta = {
  title: 'Organisms/PostsList',
  component: PostsList,
  decorators: [
    (Story) => (
      <AuthContext.Provider value={makeAuth(null)}>
        <div className="max-w-3xl">
          <Story />
        </div>
      </AuthContext.Provider>
    ),
  ],
} satisfies Meta<typeof PostsList>

export default meta
type Story = StoryObj<typeof meta>

export const DynamicLoadingLotsOfData: Story = {
  render: () => <DynamicDemo total={150} pageSize={25} />,
}

