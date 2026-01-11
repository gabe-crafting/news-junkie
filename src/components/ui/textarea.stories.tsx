import type { Meta, StoryObj } from '@storybook/react-vite'

import { Textarea } from '@/components/ui/textarea'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  args: {
    placeholder: 'Write something…',
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <Textarea {...args} className="w-[360px]" />,
}

