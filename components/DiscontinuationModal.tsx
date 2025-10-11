import React from 'react';
import XIcon from './icons/XIcon';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

interface DiscontinuationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DiscontinuationModal: React.FC<DiscontinuationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="discontinuation-modal-title"
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-orange-500/10 p-8 m-4 max-w-md w-full text-center transform transition-transform duration-300 scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-yellow-600 mb-6">
          <AlertTriangleIcon className="h-8 w-8 text-white" />
        </div>

        <h2 id="discontinuation-modal-title" className="text-2xl font-bold text-white">
          Important Update
        </h2>
        <p className="mt-4 text-slate-300">
          The <span className="font-semibold text-orange-400">Mobile Web App</span> mode will be discontinued on <span className="font-semibold text-white">October 20, 2025</span>.
        </p>
        <p className="mt-4 text-slate-400 text-sm">
          It will be replaced by a more powerful, full-stack React + TypeScript web app builder. We're excited to share more with you soon!
        </p>
        <button
          onClick={onClose}
          className="mt-8 w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all"
        >
          Got it
        </button>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default DiscontinuationModal;