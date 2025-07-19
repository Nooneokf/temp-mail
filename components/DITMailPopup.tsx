// components/DITMailPopup.tsx

'use client';

import { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

export function DITMailPopup() {
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  useEffect(() => {
    const popupDismissed = localStorage.getItem('ditmailPopupDismissed');
    if (!popupDismissed) {
      const timer = setTimeout(() => {
        setIsPopupVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissPopup = () => {
    setIsPopupVisible(false);
    localStorage.setItem('ditmailPopupDismissed', 'true');
  };

  if (!isPopupVisible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 p-0 w-[90%] sm:w-96 max-w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={handleDismissPopup}
        className="absolute top-2 right-2 z-10 text-white hover:text-gray-200 transition-colors"
        aria-label="Dismiss"
      >
        <IoClose size={24} />
      </button>

      <a
        href="https://www.g2.com/wizard/workflow-wiz-apr28-amzn10/products/freecustom-email/reviews/start?g2_campaign=it_auto_txn_snd_2025_07_19_wfl_169257_cmp_2671423_tpl_3658179_loc_&last_completed_step=4&product_id=freecustom-email&return_to=https%3A%2F%2Fwww.g2.com%2Fwizard%2Fworkflow-wiz-apr28-amzn10%2Fproducts%2Ffreecustom-email%2Ftake_survey%3Futm_source%3DIterable%26utm_medium%3Demail%26utm_campaign%3Dit_auto_txn_snd_2025_07_19_wfl_169257_cmp_2671423_tpl_3658179_loc_%26g2_campaign%3Dit_auto_txn_snd_2025_07_19_wfl_169257_cmp_2671423_tpl_3658179_loc_&utm_campaign=it_auto_txn_snd_2025_07_19_wfl_169257_cmp_2671423_tpl_3658179_loc_&utm_medium=email&utm_source=Iterable"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full h-full"
        title="Review FreeCustom.Email on G2"
      >
        <img
          src="./A_promotional_digital_graphic_from_FreeCustom.Email.png" // replace with your actual path or URL
          alt="FreeCustom.Email G2 Review"
          className="w-full h-full object-cover object-center"
        />
      </a>
    </div>
  );
}
