import { type ReactNode } from 'react'
import { AppNavigation } from './AppNavigation'
import { AppRightRail } from './AppRightRail'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-6">
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
    </div>
  )
}
