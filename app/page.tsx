
import { AppFooter } from "@/components/app-footer"
import { AppHeader } from "@/components/app-header"
import { EmailBox } from "@/components/email-box"
import { PopularArticles } from "@/components/popular-articles"
import { WhySection } from "@/components/why-section"
import { ThemeProvider } from "@/components/theme-provider"
import "@/styles/global.css"

export default function Page() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen max-w-[100vw] bg-background">
        <AppHeader />
        <main className="mx-auto m-2 px-4 py-8">
          <section className="mb-12">
            <EmailBox />
            <h1 className="mt-6 text-3xl font-bold">The Tech behind Disposable Temp Mail Address</h1>
            <p className="mb-4 text-muted-foreground">
            We all use email for various purposes, from connecting at work and with business prospects to communicating with friends. Yet, with the increase in online services requiring email addresses, spam and privacy concerns have grown. Freecustom.email helps protect your real email identity and keeps you safe from unwanted communications by offering a temporary, disposable email address.
            </p>
          </section>
          <WhySection />
          <PopularArticles />
        </main>
        <AppFooter />
      </div>
    </ThemeProvider>
  )
}