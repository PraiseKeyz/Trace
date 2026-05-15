import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Trace — Economic Identity',
  description: 'Build your Economic Identity Score and unlock opportunities in work, trade, and financial services. Built for African informal traders and gig workers.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Trace',
  },
  themeColor: '#F97316',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png',  media: '(prefers-color-scheme: dark)' },
      { url: '/trace-logo.svg',       type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

import { AuthProvider } from '@/context/auth-context'
import { Providers } from '@/lib/providers'
import { Toaster } from 'sonner'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased bg-trace-surface">
        <Providers>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors expand={false} closeButton />
            {process.env.NODE_ENV === 'production' && <Analytics />}
            <ServiceWorkerRegister />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
