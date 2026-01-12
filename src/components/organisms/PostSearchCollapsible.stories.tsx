import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { PostSearchCollapsible, type TagMode } from './PostSearchCollapsible'
import { expect, userEvent, within } from 'storybook/test'

type PostSearchState = {
  text: string
  tags: string[]
  tagMode: TagMode
}

function Example() {
  const [value, setValue] = useState<PostSearchState>({
    text: '',
    tags: [],
    tagMode: 'union',
  })

  return (
    <div className="w-full">
      <PostSearchCollapsible
        title="Search posts"
        value={value}
        onSearch={(next) => {
          setValue(next)
        }}
        onClear={() => {
          setValue({ text: '', tags: [], tagMode: 'union' })
        }}
      />
      <div className="mt-3 text-xs text-muted-foreground">
        Current value: <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
      </div>
    </div>
  )
}

const meta = {
  title: 'Organisms/PostSearchCollapsible',
  component: PostSearchCollapsible,
  parameters: {
    layout: 'fullscreen',
    actions: {
      handles: ['click button', 'keydown input', 'change input'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 16, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 900, maxWidth: 'calc(100vw - 2rem)' }}>
          <Story />
        </div>
      </div>
    ),
  ],
  render: () => <Example />,
} satisfies Meta<typeof PostSearchCollapsible>

export default meta
type Story = StoryObj<typeof meta>

const requiredArgs: Story['args'] = {
  // Not used by our custom render(), but required for Storybook TS types
  value: { text: '', tags: [], tagMode: 'union' },
  onSearch: async () => {},
  onClear: () => {},
  title: 'Search posts',
}

export const Default: Story = {
  args: {
    ...requiredArgs,
  },
}

export const AddMockTextAndTags: Story = {
  args: {
    ...requiredArgs,
  },
  parameters: {
    interactions: { autoplay: true },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /search posts/i }))

    await userEvent.clear(canvas.getByLabelText('Text'))
    await userEvent.type(canvas.getByLabelText('Text'), 'Mock text')

    const tagInput = canvas.getByLabelText('Tag')
    const tags = ['politics', 'tech', 'science', 'media', 'economy'] as const
    for (const [idx, tag] of tags.entries()) {
      await userEvent.clear(tagInput)
      await userEvent.type(tagInput, tag)
      if (idx < 2) {
        await userEvent.keyboard('{Enter}')
      } else {
        await userEvent.click(canvas.getByRole('button', { name: /add tag/i }))
      }
    }

    await userEvent.click(canvas.getByRole('button', { name: /^search$/i }))

    const currentValuePre = canvas.getByText(/current value:/i).parentElement?.querySelector('pre')
    await expect(currentValuePre).toBeTruthy()
    await expect(currentValuePre).toHaveTextContent(/"text":\s*"Mock text"/)
    for (const tag of tags) {
      await expect(currentValuePre).toHaveTextContent(new RegExp(`"${tag}"`))
    }
  },
}

export const AddShortText: Story = {
  args: {
    ...requiredArgs,
  },
  parameters: {
    interactions: { autoplay: true },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /search posts/i }))

    await userEvent.clear(canvas.getByLabelText('Text'))
    await userEvent.type(canvas.getByLabelText('Text'), 'four or five words')

    await userEvent.click(canvas.getByRole('button', { name: /^search$/i }))

    const currentValuePre = canvas.getByText(/current value:/i).parentElement?.querySelector('pre')
    await expect(currentValuePre).toBeTruthy()
    await expect(currentValuePre).toHaveTextContent(/"text":\s*"four or five words"/)
    await expect(currentValuePre).toHaveTextContent(/"tags":\s*\[\s*\]/)
  },
}

export const TagInputValidation: Story = {
  args: {
    ...requiredArgs,
  },
  parameters: {
    interactions: { autoplay: true },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: /search posts/i }))

    const tagInput = canvas.getByLabelText('Tag')

    // Valid tag should be added as a badge (via + button).
    await userEvent.clear(tagInput)
    await userEvent.type(tagInput, 'validtag')
    await userEvent.click(canvas.getByRole('button', { name: /add tag/i }))
    await expect(canvas.getByRole('button', { name: /remove tag validtag/i })).toBeInTheDocument()

    // Special characters should show an error and NOT add a badge.
    await userEvent.clear(tagInput)
    await userEvent.type(tagInput, 'bad!')
    await userEvent.keyboard('{Enter}')
    await expect(
      canvas.getByText('Tags must be a single lowercase word with no special characters.'),
    ).toBeInTheDocument()
    await expect(canvas.queryByText('bad!')).not.toBeInTheDocument()
  },
}

