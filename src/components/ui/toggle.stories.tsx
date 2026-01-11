import type { Meta, StoryObj } from '@storybook/react-vite'

import { Bold } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'

const meta = {
  title: 'UI/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Toggle aria-label="Toggle bold">
      <Bold className="h-4 w-4" />
      Bold
    </Toggle>
  ),
}

