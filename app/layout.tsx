import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { Toaster } from '@/components/ui/toast'
import { ThemeProvider } from '@/components/theme-provider'
import { PostHogProvider } from '@/components/analytics/posthog-provider'
import { PostHogPageView } from '@/components/analytics/posthog-pageview'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: { default: 'ScouttOpp', template: '%s | ScouttOpp' },
  description: 'The invitation-only platform for creative professionals. Get discovered through your work — not just your resume.',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/icon.png',
  },
  openGraph: {
    title: "Talent this good doesn't come from a job board.",
    description: 'The creative talent platform. Get discovered through your work — not just your resume.',
    siteName: 'ScouttOpp',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Talent this good doesn't come from a job board.",
    description: 'The creative talent platform. Get discovered through your work — not just your resume.',
  },
}

// Runs synchronously before React hydrates — prevents flash of wrong theme.
// Reads localStorage first; falls back to OS prefers-color-scheme.
const themeScript = `(function(){try{var s=localStorage.getItem('theme');if(s==='dark'||s==='light'){document.documentElement.setAttribute('data-theme',s);}else{var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.setAttribute('data-theme',d?'dark':'light');}}catch(e){}})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Anti-flash: sets data-theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <PostHogProvider>
          <ThemeProvider>
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
            {children}
            <Toaster />
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
