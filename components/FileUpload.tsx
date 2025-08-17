import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  fileName: string | null;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);


export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, fileName }) => {
  const { t } = useTranslation();
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/x-python': ['.py'] },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-300 ${
        isDragActive ? 'border-indigo-500 bg-gray-700/50' : 'border-gray-600 hover:border-indigo-600'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center">
        <UploadIcon />
        {fileName ? (
          <>
            <p className="mt-2 text-lg font-semibold text-green-400">{t('fileUpload.fileSelected')}</p>
            <p className="text-md text-gray-300">{fileName}</p>
          </>
        ) : (
          <>
            <p className="mt-2 text-lg font-semibold text-gray-300">
              {isDragActive ? t('fileUpload.dropHere') : t('fileUpload.dragAndDrop')}
            </p>
            <p className="text-sm text-gray-500">{t('fileUpload.acceptedFiles')}</p>
          </>
        )}
      </div>
    </div>
  );
};
