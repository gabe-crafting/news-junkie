import type { Meta, StoryObj } from '@storybook/react-vite'

import { AuthContext, type AuthContextType } from '@/contexts/auth-context'
import { AppNavigation } from './AppNavigation'

const meta = {
  title: 'Organisms/AppNavigation',
  component: AppNavigation,
  argTypes: {
    onNavigate: { action: 'navigate' },
  },
  parameters: {
    layout: 'fullscreen',
    actions: {
      handles: ['click a', 'click button'],
    },
  },
  decorators: [
    (Story) => {
      const signedOutAuth: AuthContextType = {
        user: null,
        session: null,
        loading: false,
        signOut: async () => {
          // not used by AppNavigation story anymore
        },
        profileRefreshKey: 0,
        bumpProfileRefreshKey: () => {},
        postsRefreshKey: 0,
        bumpPostsRefreshKey: () => {},
      }

      return (
        <AuthContext.Provider value={signedOutAuth}>
          <div className="h-screen w-[320px] p-4">
            <Story />
          </div>
        </AuthContext.Provider>
      )
    },
  ],
} satisfies Meta<typeof AppNavigation>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    // provided by argTypes.actions
  },
}

export const NoBrand: Story = {
  args: {
    showBrand: false,
    // provided by argTypes.actions
  },
}

