import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Loader } from './components/Loader';
import { analyzeCodeAndGenerateDocs } from './services/geminiService';
import type { DocuMentorResult } from './types';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [pythonCode, setPythonCode] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DocuMentorResult | null>(null);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPythonCode(content);
      setFileName(file.name);
      setResult(null);
      setError(null);
    };
    reader.onerror = () => {
        setError(t('app.errors.fileRead'));
    };
    reader.readAsText(file);
  };

  const handleGenerate = useCallback(async () => {
    if (!pythonCode) {
      setError(t('app.errors.noFile'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const currentLanguage = i18n.language || 'en';
      const generatedResult = await analyzeCodeAndGenerateDocs(pythonCode, currentLanguage);
      setResult(generatedResult);
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during documentation generation.';
        setError(t('app.errors.generation', { message: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  }, [pythonCode, t, i18n.language]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-lg text-gray-400 mb-8">
            {t('app.tagline')}
          </p>

          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
            <FileUpload onFileSelect={handleFileSelect} fileName={fileName} />

            <div className="mt-6 text-center">
              <button
                onClick={handleGenerate}
                disabled={!pythonCode || isLoading}
                className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-lg transform hover:scale-105 disabled:scale-100"
              >
                {isLoading ? t('app.generatingBtn') : t('app.generateBtn')}
              </button>
            </div>
          </div>

          {isLoading && <Loader />}
          
          {error && (
            <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">{t('app.errorPrefix')} </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {result && !isLoading && <ResultsDisplay result={result} />}
        </div>
      </main>
    </div>
  );
};

export default App;