import React from 'react';
import DiamondIcon from './icons/DiamondIcon';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAYMENT_URL = "https://buy.polar.sh/polar_cl_gu9SqU1tuhJ6PoQT2oUCgUpt6UjCc2NTbyOIC3QDDKb?redirect_url=" + encodeURIComponent(window.location.origin + "?upgraded=true");


const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl shadow-indigo-500/10 p-8 m-4 max-w-sm w-full text-center transform transition-transform duration-300 scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 -mt-16 mb-6">
            <DiamondIcon className="h-8 w-8 text-white" />
        </div>
        <h2 id="upgrade-modal-title" className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
            Upgrade to Pro
        </h2>
        <p className="mt-4 text-slate-400">
            Unlock premium features, priority support, and build even more powerful applications with the Pro plan.
        </p>
        <a
          href={PAYMENT_URL}
          className="mt-8 inline-block w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
        >
          Upgrade Now
        </a>
         <button 
            onClick={onClose}
            className="mt-4 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Close upgrade modal"
         >
            Maybe later
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

export default UpgradeModal;