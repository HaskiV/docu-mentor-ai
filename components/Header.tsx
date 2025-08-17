import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

const DocumentIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 mr-3 text-indigo-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

export const Header: React.FC = () => {
  const { t } = useTranslation();
  return (
    <header className="bg-gray-900/70 backdrop-blur-sm border-b border-gray-700 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
            <DocumentIcon />
            <h1 className="text-3xl font-bold tracking-tight text-white">
            {t('header.title')} <span className="text-indigo-400">{t('header.ai')}</span>
            </h1>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
};
