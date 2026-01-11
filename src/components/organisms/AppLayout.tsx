import { type ReactNode, useState } from 'react'
import { AppNavigation } from './AppNavigation'
import { AppRightRail } from './AppRightRail'
import { CreatePostDialog } from './CreatePostDialog'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-6">
        {/* Mobile/tablet header (sidebar is hidden below lg). */}
        <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] max-w-[85vw] p-4">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Primary navigation links.
              </SheetDescription>
              <div className="h-full overflow-y-auto pr-1">
                <AppNavigation onNavigate={() => setMobileNavOpen(false)} showBrand={false} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-3 min-w-0">
            <img src="/news_junkie1.png" alt="News Junkie" className="h-8 w-auto shrink-0" />
          </div>

          <div className="w-9" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside className="hidden lg:block">
            <div className="sticky top-6 h-[calc(100vh-3rem)]">
              <AppNavigation />
            </div>
          </aside>

          <main className="min-w-0">
            {children}
          </main>

          <aside className="hidden xl:block">
            <div className="sticky top-6 h-[calc(100vh-3rem)]">
              <AppRightRail />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile/tablet create-post affordance (right rail is hidden below xl). */}
      <div className="fixed bottom-6 right-6 z-50 xl:hidden">
        <CreatePostDialog triggerVariant="fab" triggerClassName="size-14 rounded-full shadow-lg" />
      </div>
    </div>
  )
}

