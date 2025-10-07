import React from 'react';
import ZapIcon from './icons/ZapIcon';
import ExternalLinkIcon from './icons/ExternalLinkIcon';

interface QuotaErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BILLING_URL = "https://aistudio.google.com/app/billing";

const QuotaErrorModal: React.FC<QuotaErrorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quota-error-modal-title"
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl shadow-yellow-500/10 p-8 m-4 max-w-sm w-full text-center transform transition-transform duration-300 scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 -mt-16 mb-6">
            <ZapIcon className="h-8 w-8 text-white" />
        </div>
        <h2 id="quota-error-modal-title" className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-transparent bg-clip-text">
            Oh no!
        </h2>
        <p className="mt-4 text-slate-300">
            You may be out of credits for the current Gemini model.
        </p>
        <p className="mt-2 text-slate-400 text-sm">
            You can switch to a different model in Settings, or set up billing with Google to continue.
        </p>
        <a
          href={BILLING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
        >
          Set up billing at AI Studio
          <ExternalLinkIcon className="w-4 h-4" />
        </a>
         <button 
            onClick={onClose}
            className="mt-4 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Close quota error modal"
         >
            Close
        </button>
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes scale-in {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default QuotaErrorModal;
