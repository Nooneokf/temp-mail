export const metadata = {
  title: 'Temp-Mail - Professional Temporary Email Service',
  description: 'Create instant, secure temporary email addresses. Perfect for protecting privacy, avoiding spam, and managing online registrations.',
  keywords: 'temp mail, disposable email, custom mail, fake email, temporary inbox, no ads email, 10minmail, email privacy, free temp mail',
  openGraph: {
    title: 'Temp-Mail - Professional Temporary Email Service',
    description: 'Create instant, secure temporary email addresses. Perfect for protecting privacy, avoiding spam, and managing online registrations.',
    url: 'https://www.freecustom.email/',
    images: [
      {
        url: 'https://www.freecustom.email/logo.webp',
        alt: 'FreeCustom.Email Logo',
      },
    ],
  },
};
import { GoogleAnalytics } from '@next/third-parties/google';
import "@/styles/global.css";
import Providers from "@/components/Providers";
import { getServerSession } from "next-auth"; // server-side session fetch

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(); // fetch session server-side

  return (
    <html lang="en">
      <head>
        <GoogleAnalytics gaId="G-RXTEEVC8C4" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}