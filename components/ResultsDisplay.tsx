import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DocuMentorResult } from '../types';
import { CodeBlock } from './CodeBlock';

interface ResultsDisplayProps {
  result: DocuMentorResult;
}

type Tab = 'readme' | 'code';

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('readme');

  const TabButton: React.FC<{ tabName: Tab; label: string }> = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-6 py-2 text-lg font-medium rounded-t-lg transition-colors duration-200 ${
        activeTab === tabName
          ? 'bg-gray-800 text-indigo-400 border-b-2 border-indigo-400'
          : 'bg-transparent text-gray-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mt-10">
      <h2 className="text-3xl font-bold text-center mb-6">{t('results.title')}</h2>
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <TabButton tabName="readme" label={t('results.readmeTab')} />
          <TabButton tabName="code" label={t('results.codeTab')} />
        </nav>
      </div>
      <div className="mt-4">
        {activeTab === 'readme' && <CodeBlock content={result.readme} language="markdown" />}
        {activeTab === 'code' && <CodeBlock content={result.updatedCode} language="python" />}
      </div>
    </div>
  );
};
