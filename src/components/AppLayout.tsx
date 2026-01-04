import { type ReactNode } from 'react'
import { AppNavigation } from './AppNavigation'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen">
      <AppNavigation />
      <main className="w-full max-w-[1280px] mx-auto px-8 pb-8">
        {children}
      </main>
    </div>
  )
}
