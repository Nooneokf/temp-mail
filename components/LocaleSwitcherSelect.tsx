'use client';

import clsx from 'clsx';
import { useParams } from 'next/navigation';
import { Locale } from 'next-intl';
import { ChangeEvent, ReactNode, useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';

type Props = {
  children: ReactNode;
  defaultValue: string;
  label: string;
};

export default function LocaleSwitcherSelect({
  children,
  defaultValue,
  label
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as Locale;
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        {pathname, params},
        {locale: nextLocale}
      );
    });
  }

  return (
    <label className="relative inline-block text-sm">
      <span className="sr-only">{label}</span>
      <select
        className={clsx(
          'dark:bg-slate-900 bg-white text-black dark:text-white rounded-md border cursor-pointer',
          'px-3 py-2 appearance-none transition-colors duration-150',
          'hover:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
          isPending && 'opacity-60 cursor-not-allowed'
        )}
        defaultValue={defaultValue}
        disabled={isPending}
        onChange={onSelectChange}
      >
        {children}
      </select>
    </label>
  );
}
