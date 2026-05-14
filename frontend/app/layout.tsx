import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Trace - Economic Identity for African Workers',
  description: 'Build your Economic Identity Score and unlock opportunities in work, trade intelligence, and financial services. Designed for African informal traders and gig workers.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

import { AuthProvider } from '@/context/auth-context'
import { Providers } from '@/lib/providers'
import { Toaster } from 'sonner'

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
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
