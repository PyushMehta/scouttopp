import { type ReactNode }  from 'react'
import { AdminSidebar }    from '@/components/dashboard/admin-sidebar'
import { AdminTopBar }     from '@/components/dashboard/admin-topbar'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
