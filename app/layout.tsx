import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'
import './globals.css'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
  weight: ['600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Contractual | Hire Expert Freelancers. Get Work Done Right.',
  description:
    'Contractual connects businesses with skilled freelancers through structured gigs, transparent contracts, and end-to-end project management. Find top talent or land your next gig today.',
  keywords: [
    'freelance',
    'marketplace',
    'hire freelancers',
    'gigs',
    'contracts',
    'remote work',
    'talent',
  ],
  authors: [{ name: 'Contractual' }],
  openGraph: {
    title: 'Contractual | Hire Expert Freelancers',
    description:
      'Connect with skilled freelancers through structured gigs and transparent contracts.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#6d9c9f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton duration={4000} />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
