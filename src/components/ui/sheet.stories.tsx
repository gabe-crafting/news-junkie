import type { Meta, StoryObj } from '@storybook/react-vite'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const meta = {
  title: 'UI/Sheet',
  component: Sheet,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Left: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            // Disable aria-valid-attr-value rule - Radix UI Sheet dynamically generates IDs
            // for aria-controls that may not exist when sheet is closed (false positive)
            // Radix UI handles this correctly at runtime
            id: 'aria-valid-attr-value',
            enabled: false,
          },
        ],
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button type="button">Open sheet</Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Example left sheet content.</SheetDescription>
          <div className="text-sm text-muted-foreground">
            Put navigation or other content here.
          </div>
        </SheetContent>
      </Sheet>
    )
  },
}

