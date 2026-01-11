import type { Meta, StoryObj } from "@storybook/react-vite"

const meta = {
  // Use a slash to make "Organisms" a top-level group in the sidebar.
  title: "Organisms/Overview",
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => <div className="text-sm text-muted-foreground">Organisms</div>,
}

