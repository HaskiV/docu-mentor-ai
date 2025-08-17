import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const Loader: React.FC = () => {
  const { t } = useTranslation();
  
  const messages = React.useMemo(() => [
    t('loader.analyzing'),
    t('loader.consulting'),
    t('loader.generatingReadme'),
    t('loader.craftingDocstrings'),
    t('loader.assembling'),
    t('loader.finalizing')
  ], [t]);

  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 2500);

    return () => clearInterval(intervalId);
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center my-10">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-500"></div>
      <p className="mt-4 text-lg text-gray-300 transition-opacity duration-500">{message}</p>
    </div>
  );
};
