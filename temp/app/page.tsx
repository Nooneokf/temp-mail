
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
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-4 py-8">
          <section className="mb-12">
            <EmailBox />
            <h1 className="mb-6 text-3xl font-bold">The Tech behind Disposable Email Addresses</h1>
            <p className="mb-4 text-muted-foreground">
              Everyone owns an email address each and every hour, for everything from connecting at work, with business prospects, reaching out to friends and colleagues using the email address as an online passport. Nearly 99% of all apps and services we sign-up today required an email address, likewise to most shoppers loyalty cards, contest and offer entries, and more.
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

