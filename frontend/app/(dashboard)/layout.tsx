import { DashboardSidebar } from '@/components/DashboardSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <DashboardSidebar />
      <div className="flex flex-col min-h-screen lg:pl-64">
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
