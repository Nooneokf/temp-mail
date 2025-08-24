import { notFound } from 'next/navigation';
import { Locale, hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { Inter } from 'next/font/google';
import { routing } from '@/i18n/routing';
import '@/styles/global.css';

type Props = {
    children: ReactNode;
    params: Promise<{ locale: Locale }>;
};

const inter = Inter({ subsets: ['latin'] });

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

// Generates language-specific SEO metadata for each page.
export async function generateMetadata(props: Omit<Props, 'children'>) {

    const { locale } = await props.params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });

    return {
        title: t('title'),
        description: t('description'),
        keywords: t('keywords'),
        openGraph: {
            title: t('openGraph.title'),
            description: t('openGraph.description'),
            url: `https://www.freecustom.email/${locale}`,
            images: [
                {
                    url: 'https://www.freecustom.email/logo.webp',
                    alt: t('openGraph.alt'),
                },
            ],
        },
    };
}
export default async function LocaleLayout({ children, params }: Props) {
    // Ensure that the incoming `locale` is valid
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    // Enable static rendering
    setRequestLocale(locale);

    return (
        <NextIntlClientProvider>
            {children}
        </NextIntlClientProvider>
    );
}