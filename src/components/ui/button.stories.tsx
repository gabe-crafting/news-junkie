import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '@/components/ui/button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button ariaLabel={false}>Default</Button>
      <Button variant="secondary" ariaLabel={false}>Secondary</Button>
      <Button variant="outline" ariaLabel={false}>Outline</Button>
      <Button variant="ghost" ariaLabel={false}>Ghost</Button>
      <Button variant="link" ariaLabel={false}>Link</Button>
      <Button variant="destructive" ariaLabel={false}>Destructive</Button>
      <Button disabled ariaLabel={false}>Disabled</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm" ariaLabel={false}>Small</Button>
      <Button size="default" ariaLabel={false}>Default</Button>
      <Button size="lg" ariaLabel={false}>Large</Button>
    </div>
  ),
}

