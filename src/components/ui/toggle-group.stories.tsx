import type { Meta, StoryObj } from '@storybook/react-vite'

import { useState } from 'react'
import { Bold, Italic, Underline } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

function ToggleGroupSingleExample() {
  const [value, setValue] = useState<string>('bold')

  return (
    <ToggleGroup type="single" value={value} onValueChange={setValue}>
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <Underline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

function ToggleGroupMultipleExample() {
  const [value, setValue] = useState<string[]>(['bold'])

  return (
    <ToggleGroup type="multiple" value={value} onValueChange={setValue}>
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <Underline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

const meta = {
  title: 'UI/ToggleGroup',
  component: ToggleGroup,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ToggleGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  args: {
    type: 'single',
  },
  render: () => {
    return <ToggleGroupSingleExample />
  },
}

export const Multiple: Story = {
  args: {
    type: 'multiple',
  },
  render: () => {
    return <ToggleGroupMultipleExample />
  },
}

