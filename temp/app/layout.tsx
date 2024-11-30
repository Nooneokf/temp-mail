export const metadata = {
  title: 'No ads + FREE Temp Mail - the best temporary email service',
  description: 'Keep your real email inbox clean. Temporary emails are perfect for any transaction where you want to improve your online privacy. Use our disposable email addresses for ad blocking, no spam, no ads, just temporary mail.',

  // Open Graph
  ogTitle: 'No ads + FREE Temp Mail - the best temporary email service',
  ogDescription: 'Keep your real email inbox clean. Temporary emails are perfect for any transaction where you want to improve your online privacy. Use our disposable email addresses for ad blocking, no spam, no ads, just temporary mail.',
  ogImage: 'https://tempmail.dev/og-image.jpg',
  ogUrl: 'https://tempmail.dev/',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
