import { DashboardSidebar } from '@/components/DashboardSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-trace-surface">
      <DashboardSidebar />
      {/* lg:pl-64 offsets the fixed desktop sidebar */}
      <div className="flex flex-col min-h-screen lg:pl-64">
        <main className="flex-1 p-4 lg:p-8 pt-[4.5rem] lg:pt-8 pb-20 lg:pb-8">
          <div className="mx-auto w-full lg:max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
