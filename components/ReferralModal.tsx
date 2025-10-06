import React from 'react';
import PartyPopperIcon from './icons/PartyPopperIcon';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTrial: () => void;
  referrerId: string | null;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose, onStartTrial, referrerId }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="referral-modal-title"
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl shadow-green-500/10 p-8 m-4 max-w-md w-full text-center transform transition-transform duration-300 scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 -mt-16 mb-6">
            <PartyPopperIcon className="h-8 w-8 text-white" />
        </div>
        <h2 id="referral-modal-title" className="text-3xl font-bold bg-gradient-to-r from-green-300 to-cyan-400 text-transparent bg-clip-text">
            Welcome!
        </h2>
        <p className="mt-4 text-slate-300">
            You've been referred by <strong className="text-white">{referrerId || 'a friend'}</strong>! They just got free generations for inviting you.
        </p>
        <p className="mt-4 text-slate-400">
            As a welcome gift, you get <strong>10% off</strong> your first upgrade and a free <strong>24-hour trial of the Pro plan</strong>.
        </p>
        <button
          onClick={onStartTrial}
          className="mt-8 inline-block w-full px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500"
        >
          Start 24-Hour Pro Trial
        </button>
         <button 
            onClick={onClose}
            className="mt-4 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Close referral modal"
         >
            Maybe later
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

export default ReferralModal;