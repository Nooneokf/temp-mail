export function AwardsSection() {
  return (
    <section className="bg-white dark:bg-black py-12 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
          Awards & Recognition
        </h2>
        <div className="flex justify-center">
          <a
            href="https://www.goodfirms.co/email-marketing-software/"
            target="_blank"
            rel="noopener noreferrer"
            title="Top Email Marketing Software"
          >
            <img
              src="https://assets.goodfirms.co/badges/color-badge/email-marketing-software.svg"
              alt="Top Email Marketing Software"
              className="w-[243px]"
            />
          </a>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-200 text-sm">
          Proudly listed among the{" "}
          <a
            href="https://www.goodfirms.co/email-marketing-software/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Top Email Marketing Software on GoodFirms
          </a>.
        </p>
      </div>
    </section>
  );
}
