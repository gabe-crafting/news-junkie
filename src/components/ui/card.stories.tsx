import type { Meta, StoryObj } from '@storybook/react-vite'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Card content goes here.
      </CardContent>
      <CardFooter className="justify-end">
        <Button size="sm">Action</Button>
      </CardFooter>
    </Card>
  ),
}

