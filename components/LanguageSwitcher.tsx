import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const languages = [
    { code: 'en', name: 'EN' },
    { code: 'ru', name: 'RU' },
  ];

  return (
    <div className="flex space-x-2 bg-gray-800 p-1 rounded-lg">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-1 text-sm font-semibold rounded-md transition-all duration-200 ${
            i18n.resolvedLanguage === lang.code
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-transparent text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
          }`}
          aria-pressed={i18n.resolvedLanguage === lang.code}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
};
