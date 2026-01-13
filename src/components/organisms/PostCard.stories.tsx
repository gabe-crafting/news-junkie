import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Post } from '@/hooks/usePosts'
import { AuthContext, type AuthContextType } from '@/contexts/auth-context'
import { PostCard } from '@/components/organisms/PostCard'

type AuthUser = NonNullable<AuthContextType['user']>

const basePost: Post = {
  id: 'post_1',
  user_id: 'user_1',
  description: 'A quick summary of the article.\n\nSecond paragraph for multiline rendering.',
  news_link: 'https://example.com/news/story',
  archive_link: null,
  tags: ['ai', 'policy', 'security'],
  created_at: '2026-01-13T12:00:00.000Z',
  author: {
    id: 'user_1',
    name: 'Gabe',
    profile_picture_url: null,
  },
}

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

const meta = {
  title: 'Organisms/PostCard',
  component: PostCard,
  decorators: [
    (Story) => (
      <AuthContext.Provider value={makeAuth('user_1')}>
        <div className="max-w-2xl">
          <Story />
        </div>
      </AuthContext.Provider>
    ),
  ],
  args: {
    post: basePost,
  },
} satisfies Meta<typeof PostCard>

export default meta
type Story = StoryObj<typeof meta>

export const OwnPost: Story = {}

export const OtherUsersPost: Story = {
  decorators: [
    (Story) => (
      <AuthContext.Provider value={makeAuth('user_viewer')}>
        <div className="max-w-2xl">
          <Story />
        </div>
      </AuthContext.Provider>
    ),
  ],
  args: {
    post: {
      ...basePost,
      id: 'post_2',
      user_id: 'user_other',
      author: {
        id: 'user_other',
        name: 'Someone Else',
        profile_picture_url: null,
      },
    },
  },
}

export const WithArchiveLink: Story = {
  args: {
    post: {
      ...basePost,
      id: 'post_3',
      archive_link: 'https://web.archive.org/web/20260101/https://example.com/news/story',
      tags: ['archived'],
    },
  },
}

export const ManyTags: Story = {
  args: {
    post: {
      ...basePost,
      id: 'post_many_tags',
      tags: [
        'ai',
        'politics',
        'economics',
        'science',
        'security',
        'privacy',
        'health',
        'sports',
        'finance',
        'climate',
        'space',
        'energy',
        'education',
        'history',
        'culture',
      ],
    },
  },
}

export const LongDescription: Story = {
  args: {
    post: {
      ...basePost,
      id: 'post_long_description',
      description:
        'This is a long description intended to stress test wrapping, spacing, and overall readability.\n\n' +
        'It includes multiple paragraphs, line breaks, and some extra content so you can see how the card behaves when a user writes a lot.\n\n' +
        'Key points:\n' +
        '- The description should wrap naturally.\n' +
        '- The card should keep its spacing.\n' +
        '- Buttons should stay aligned.\n\n' +
        'Final thought: if this feels too dense, we can clamp it in the UI later—but for now it’s useful for visual QA.',
    },
  },
}

