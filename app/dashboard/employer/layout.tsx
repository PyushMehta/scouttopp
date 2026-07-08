import { type ReactNode } from 'react'
import { EmployerSidebar } from '@/components/dashboard/employer-sidebar'
import { EmployerTopBar }  from '@/components/dashboard/employer-topbar'

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <EmployerSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <EmployerTopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
