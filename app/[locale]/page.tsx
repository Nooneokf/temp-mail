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

type Props = {
    params: Promise<{ locale: Locale }>;
};

export default async function Page({ params }: Props) {
    const { locale } = await params;

    // Set the locale for the current request (for static rendering)
    setRequestLocale(locale);

    // ✅ Use getTranslations instead of useTranslations
    const t = await getTranslations({ locale, namespace: 'PageContent' });
    const tJsonLd = await getTranslations({ locale, namespace: 'JsonLd' });

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
                    <AppHeader />
                    <main className="mx-auto m-2 px-4 py-8">
                        <section className="mb-12">
                            <EmailBox />
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
            </ThemeProvider>
        </>
    );
}
