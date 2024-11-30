export const metadata = {
  title: 'Free Custom Temporary Email Address - Temp Mail',
  description: 'Keep your real email inbox clean. Temporary emails are perfect for any transaction where you want to improve your online privacy. Use our disposable email addresses for ad blocking, no spam, no ads, just temporary mail.',
  favicon: '/favicon.ico',
  // Open Graph
  ogTitle: 'Free Custom Temporary Email Address - Temp Mail',
  ogDescription: 'Keep your real email inbox clean. Temporary emails are perfect for any transaction where you want to improve your online privacy. Use our disposable email addresses for ad blocking, no spam, no ads, just temporary mail.',
  ogImage: 'https://freecustom.email/logo.png',
  ogUrl: 'https://freecustom.email/',
  // Target Keywords
  keywords: 'temp mail, custom mail, disposable email, temporary email, fake email, email privacy, spam-free email, temporary inbox'
}
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
      <GoogleAnalytics gaId="G-RXTEEVC8C4" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
