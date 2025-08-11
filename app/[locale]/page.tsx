// app/[locale]/page.tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AppFooter } from '@/components/app-footer';
import { AppHeader } from '@/components/app-header';
import { EmailBox } from '@/components/email-box';
import { PopularArticles } from '@/components/popular-articles';
import { WhySection } from '@/components/why-section';
import Status from '@/components/Status';
import Script from 'next/script';
import Link from 'next/link';
import { Locale } from 'next-intl';
import { ThemeProvider } from '@/components/theme-provider';
import { DITMailPopup } from '@/components/DITMailPopup';

// --- NEW IMPORTS for Server-Side Data Fetching ---
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path if needed
import { fetchFromServiceAPI } from '@/lib/api'; // Assuming this is your API helper

type Props = {
    params: { locale: Locale };
};

export default async function Page({ params }: Props) {
    const { locale } = params;
    setRequestLocale(locale);

    const t = await getTranslations({ locale, namespace: 'PageContent' });
    const tJsonLd = await getTranslations({ locale, namespace: 'JsonLd' });

    // --- 1. Fetch Session and Custom Domains on the Server ---
    const session = await getServerSession(authOptions);
    let customDomains = []; // Default to an empty array

    // Only fetch domains if the user is authenticated and has a 'pro' plan
    if (session?.user?.id && session.user.plan === 'pro') {
        try {
            // Replicate the logic from your API route to fetch domains directly
            const serviceResponse = await fetchFromServiceAPI(`/user/${session.user.id}/domains`);
            // Ensure we have an array, even if the API response is unexpected
            if (Array.isArray(serviceResponse.domains)) {
                customDomains = serviceResponse.domains;
            }
        } catch (error) {
            console.error("Failed to fetch custom domains on server:", error);
            // Don't block the page render; proceed with empty domains
        }
    }


    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: tJsonLd('name'),
        url: 'https://www.freecustom.email',
        logo: 'https://www.freecustom.email/logo.webp',
        description: tJsonLd('description'),
        sameAs: [
            'https://www.linkedin.com/company/freecustom-email',
            'https://github.com/DishantSinghDev/temp-mail',
            'https://www.producthunt.com/products/freecustom-email',
        ],
    };

    return (
        <><Script
            id="json-ld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <div className="min-h-screen max-w-[100vw] bg-background">
                    <AppHeader initialSession={session}/>
                    <main className="mx-auto m-2 px-4 py-8">
                        <section className="mb-12">
                            {/* --- 2. Pass Fetched Data as Props to the Client Component --- */}
                            <EmailBox
                                initialSession={session}
                                initialCustomDomains={customDomains}
                            />
                            <Status />

                            <h1 className="mt-6 text-xl sm:text-2xl md:text-3xl font-semibold">
                                {t('h1')}
                            </h1>

                            <p
                                className="mb-4 text-muted-foreground leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: t.raw('p1') }}
                            ></p>

                            <p className="mb-4 text-muted-foreground leading-relaxed">
                                {t.rich('p2_part1', {
                                    strong: (chunks) => <strong>{chunks}</strong>
                                })}
                                <Link className="text-blue-700 hover:underline" href="/blog/forever-free-and-ad-free">
                                    {t('p2_link1')}
                                </Link>
                                {t.rich('p2_part2')}
                                <Link className="text-blue-700 hover:underline" href="/blog/why-we-are-fastest">
                                    {t('p2_link2')}
                                </Link>
                                {t.rich('p2_part3')}
                            </p>
                        </section>

                        <WhySection />
                        <PopularArticles />
                    </main>
                    <AppFooter />
                </div>
                <DITMailPopup />
            </ThemeProvider>
        </>
    );
}
