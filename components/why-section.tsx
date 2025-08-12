import { WhySectionKeys } from '@/lib/i18n-types';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link'; // Use the localized Link
import { FaCheckCircle } from 'react-icons/fa';

export async function WhySection() {
  const t = await getTranslations('WhySection');
  const features = [
    'checklist_item1',
    'checklist_item2',
    'checklist_item3',
    'checklist_item4',
    'checklist_item5',
    'checklist_item6',
  ];
  const useCases = ['use_case_item1', 'use_case_item2', 'use_case_item3', 'use_case_item4'];

  return (
    <section className="space-y-4">
      {/* --- REVISED: Updated background, removed shadow --- */}
      <div className="bg-white dark:bg-black border dark:border-gray-700 rounded-lg p-6">
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
          {t('snippet_title')}
        </h2>
        <p
          className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: t.raw('snippet_p') }}
        ></p>
      </div>

      {/* --- REVISED: Updated background, removed shadow --- */}
      <div className="bg-white dark:bg-black border dark:border-gray-700 p-6 rounded-lg">
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">{t('domain_list_title')}</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{t('domain_list_p')}</p>
        <ul className="mt-4 list-disc pl-5 text-gray-700 dark:text-gray-200 space-y-1">
          {['saleis.live','arrangewith.me', 'areureally.info', 'ditapi.info', 'ditcloud.info', 'ditdrive.info', 'ditgame.info', 'ditlearn.info', 'ditpay.info', 'ditplay.info', 'ditube.info', 'junkstopper.info'].map(domain => (
            <li key={domain}>{domain}</li>
          ))}
        </ul>
      </div>

      {/* --- REVISED: Updated background, removed shadow --- */}
      <div className="bg-white dark:bg-black border dark:border-gray-700 p-6 rounded-lg">
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">{t('definition_title')}</h2>
        <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
          {t.rich('definition_p', {
            strong: (chunks) => <strong>{chunks}</strong>,
            em: (chunks) => <em>{chunks}</em>,
            link: (chunks) => <Link href="/blog/how-to-create-temp-mail" className="text-blue-600 underline dark:text-blue-400">{chunks}</Link>
          })}
        </p>
      </div>
      
      {/* --- REVISED: Updated background, removed shadow --- */}
      <div className="bg-white dark:bg-black border dark:border-gray-700 p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('use_case_title')}</h3>
        <ul className="mt-4 space-y-3">
          {useCases.map((item, i) => (
            <li key={i} className="flex items-start">
              <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span className="dark:text-gray-200">{t(item as WhySectionKeys)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* --- REVISED: Updated background, removed shadow --- */}
      <div className="bg-white dark:bg-black border dark:border-gray-700 p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('checklist_title')}</h3>
        <ul className="mt-4 space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start dark:text-gray-200">
              <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              {t(feature as WhySectionKeys)}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed"
           dangerouslySetInnerHTML={{ __html: t.raw('checklist_p') }}>
        </p>
      </div>

      {/* --- REVISED: Updated background, removed shadow --- */}
       <div className="bg-white dark:bg-black border dark:border-gray-700 p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('usage_title')}</h3>
        <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
          {t.rich('usage_p1', {
            strong: (chunks) => <strong>{chunks}</strong>,
            link: (chunks) => <Link href="/blog/how-to-create-temp-mail" className="text-blue-600 underline dark:text-blue-400">{chunks}</Link>
          })}
        </p>
        <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">{t('usage_p2')}</p>
      </div>

      {/* --- REVISED: Updated background, removed shadow --- */}
      <div className="bg-white dark:bg-black border dark:border-gray-700 p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('conclusion_title')}</h3>
        <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">{t('conclusion_p1')}</p>
        <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
          {t.rich('conclusion_p2', {
            link: (chunks) => <Link href="/blog/best-practices-for-using-temp-mail" className="text-blue-600 underline dark:text-blue-400">{chunks}</Link>
          })}
        </p>
      </div>
    </section>
  );
}