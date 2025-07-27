export const metadata = {
  title: 'Free Custom Temporary Email Address - Temp Mail',
  description: 'Create custom temporary email addresses to block spam and protect your privacy. No ads, no signup—just fast, disposable email.',
  keywords: 'temp mail, disposable email, custom mail, fake email, temporary inbox, no ads email, 10minmail, email privacy, free temp mail',
  openGraph: {
    title: 'Free Custom Temporary Email Address - Temp Mail',
    description: 'Create custom temporary email addresses to block spam and protect your privacy. No ads, no signup—just fast, disposable email.',
    url: 'https://www.freecustom.email/',
    images: [
      {
        url: 'https://www.freecustom.email/logo.webp',
        alt: 'FreeCustom.Email Logo',
      },
    ],
  },
};

import { GoogleAnalytics } from '@next/third-parties/google'
import "@/styles/global.css"

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
<script type="text/javascript" src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" async></script>
      </head>
      <body>{children}</body>
    </html>
  )
}
