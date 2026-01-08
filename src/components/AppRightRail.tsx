import { CreatePostDialog } from '@/components/CreatePostDialog'

export function AppRightRail() {
  return (
    <div className="h-full flex flex-col gap-6">
      <CreatePostDialog triggerClassName="w-full justify-center gap-2" />
    </div>
  )
}


