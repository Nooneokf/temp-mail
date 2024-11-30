export const metadata = {
  title: 'Free Custom Temporary Email Address - Temp Mail',
  description: 'Keep your real email inbox clean. Temporary emails are perfect for any transaction where you want to improve your online privacy. Use our disposable email addresses for ad blocking, no spam, no ads, just temporary mail.',
  favicon: '/favicon.ico',
  // Open Graph
  ogTitle: 'Free Custom Temporary Email Address - Temp Mail',
  ogDescription: 'Keep your real email inbox clean. Temporary emails are perfect for any transaction where you want to improve your online privacy. Use our disposable email addresses for ad blocking, no spam, no ads, just temporary mail.',
  ogImage: 'https://tempmail.dev/og-image.jpg',
  ogUrl: 'https://tempmail.dev/',
  // Target Keywords
  keywords: 'temp mail, custom mail, disposable email, temporary email, fake email, email privacy, spam-free email, temporary inbox'
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
