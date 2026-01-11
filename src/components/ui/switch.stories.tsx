import type { Meta, StoryObj } from '@storybook/react-vite'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'

const meta = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(true)
    return (
      <div className="flex items-center gap-3">
        <Switch checked={checked} onCheckedChange={setChecked} aria-label="Toggle setting" />
        <div className="text-sm text-muted-foreground">{checked ? 'On' : 'Off'}</div>
      </div>
    )
  },
}

