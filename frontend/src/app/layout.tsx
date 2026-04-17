import type { Metadata, Viewport } from 'next'
import { Josefin_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'
import './globals.css'

const josefin = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-josefin',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
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
  icons: {
    icon: '/WhatsApp_Image_2026-04-10_at_2.50.59_PM-removebg-preview.png',
    shortcut: '/WhatsApp_Image_2026-04-10_at_2.50.59_PM-removebg-preview.png',
    apple: '/WhatsApp_Image_2026-04-10_at_2.50.59_PM-removebg-preview.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#6d9c9f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${josefin.variable} ${jakarta.variable} ${jetbrainsMono.variable}`}>
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
