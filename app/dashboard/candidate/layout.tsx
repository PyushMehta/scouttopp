import { type ReactNode }      from 'react'
import { CandidateSidebar }    from '@/components/dashboard/candidate-sidebar'
import { CandidateTopBar }     from '@/components/dashboard/candidate-topbar'

export default function CandidateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <CandidateSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <CandidateTopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
