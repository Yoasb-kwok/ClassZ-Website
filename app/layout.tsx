import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { LanguageProvider } from '@/components/language-provider'
import { ViewportHeightFix } from '@/components/viewport-height-fix'

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-poppins"
});

import { generateMetadata as genMeta, generateStructuredData } from '@/lib/metadata'

export const metadata = genMeta({
  title: 'ClassZ - Discover, Book & Track Extracurricular Classes for Kids',
  description: 'ClassZ is your all-in-one platform for discovering enrichment classes, booking sessions seamlessly, and tracking your child\'s learning progress. From sports to arts, coding to music - find the perfect class for your child.',
  url: '/',
  keywords: [
    'kids classes',
    'extracurricular activities',
    'children enrichment',
    'after school programs',
    'kids sports classes',
    'kids art classes',
    'coding for kids',
    'music lessons',
    'dance classes',
    'swimming lessons',
    'class booking',
    'learning progress tracking',
    'Hong Kong kids activities',
    'family activities',
    'child development'
  ],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const organizationSchema = generateStructuredData('organization')
  const websiteSchema = generateStructuredData('website')

  return (
    <html lang="en">
      <head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* Favicon */}
        <link rel="icon" href="/icon-light-32x32.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/icon-dark-32x32.png" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ViewportHeightFix />
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
