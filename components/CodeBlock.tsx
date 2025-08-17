import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CodeBlockProps {
  content: string;
  language: string;
}

const CopyIcon: React.FC<{ copied: boolean }> = ({ copied }) => (
  copied ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
);

export const CodeBlock: React.FC<CodeBlockProps> = ({ content, language }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 relative overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-700/50 border-b border-gray-700">
        <span className="text-xs font-semibold text-gray-400 uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className={`flex items-center space-x-2 text-sm px-3 py-1 rounded-md transition-all duration-200 ${
            copied ? 'bg-green-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
          }`}
        >
          <CopyIcon copied={copied} />
          <span>{copied ? t('codeBlock.copied') : t('codeBlock.copy')}</span>
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto text-gray-200">
        <code>{content}</code>
      </pre>
    </div>
  );
};
