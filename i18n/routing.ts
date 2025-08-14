import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'de', 'zh', 'es', 'hi', 'fr', 'ru'],
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/blog': '/blog',                // 👈 no prefix
    '/blog/[slug]': '/blog/[slug]',   // 👈 no prefix for individual posts
    '/docs': '/docs'
  }
});
