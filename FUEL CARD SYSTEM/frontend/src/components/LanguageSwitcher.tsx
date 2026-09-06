import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto z-50">
      <select
        value={i18n.language}
        onChange={handleLanguageChange}
        className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
      >
        <option value="en">English</option>
        <option value="ar">العربية</option>
        <option value="ku">کوردی</option>
      </select>
    </div>
  );
};
