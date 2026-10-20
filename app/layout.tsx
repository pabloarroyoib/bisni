import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { SanityLive } from '@/sanity/lib/live'
import './globals.css'

export const metadata: Metadata = {
  title: 'bisni — Riesgo claro. Decisiones sólidas.',
  description: 'Consultoría B2B de gestión de riesgos corporativos, ciberseguridad y cumplimiento ISO 31000.',
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

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        <SanityLive />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
