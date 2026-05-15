import { CheckCircle } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  panel: {
    headline: string
    accentLine: string
    features: { title: string; desc: string }[]
  }
  reversed?: boolean
}

export function AuthLayout({ children, panel, reversed = false }: AuthLayoutProps) {
  const formCol = (
    <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 lg:py-0">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )

  const panelCol = (
    <div className="hidden lg:flex flex-col items-center justify-center px-8 py-12 bg-gradient-to-br from-slate-950 to-slate-800">
      <div className="max-w-md text-white">
        <h2 className="text-3xl font-black mb-10 leading-tight">
          {panel.headline}
          <br />
          <span className="text-trace-accent">{panel.accentLine}</span>
        </h2>
        <div className="space-y-6">
          {panel.features.map((item) => (
            <div key={item.title} className="flex gap-4">
              <CheckCircle size={20} className="text-trace-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-0.5">{item.title}</p>
                <p className="text-sm text-white/60">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
        {reversed ? (
          <>
            {panelCol}
            {formCol}
          </>
        ) : (
          <>
            {formCol}
            {panelCol}
          </>
        )}
    </div>
  )
}
