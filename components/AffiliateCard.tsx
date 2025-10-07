import React from 'react';
import SiloLogoIcon from './icons/SiloLogoIcon';
import ChipIcon from './icons/ChipIcon';
import CopyIcon from './icons/CopyIcon';
import UsersIcon from './icons/UsersIcon';
import SparklesIcon from './icons/SparklesIcon';

interface AffiliateCardProps {
  userName: string | null;
  affiliateUrl: string;
  clicks: number;
  credits: number;
  onCopy: () => void;
  copyText: string;
}

const AffiliateCard: React.FC<AffiliateCardProps> = ({ userName, affiliateUrl, clicks, credits, onCopy, copyText }) => {
  const urlToShow = affiliateUrl.replace('https://', '');

  return (
    <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black border border-slate-700 rounded-2xl p-6 shadow-2xl shadow-indigo-500/10 w-full max-w-lg mx-auto transform hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
            <SiloLogoIcon className="w-8 h-8" />
            <span className="font-semibold text-white">Silo Build</span>
        </div>
        <ChipIcon className="w-10 h-10 text-slate-500" />
      </div>

      <div className="mb-6">
        <label className="text-xs text-slate-400">Your Unique Affiliate URL</label>
        <div className="relative mt-1">
          <div className="w-full p-3 pr-24 bg-black/30 backdrop-blur-sm border border-white/10 rounded-full shadow-inner text-indigo-300 font-mono text-sm truncate pl-4">
            {urlToShow}
          </div>
          <button
            onClick={onCopy}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full transition-colors text-xs disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            <CopyIcon className="w-3.5 h-3.5" />
            {copyText}
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-end">
        <div>
            <p className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{userName || 'MEMBER'}</p>
            <p className="text-xs text-slate-400">Affiliate Member</p>
        </div>
        <div className="flex items-center gap-4 text-right">
             <div>
                <label className="text-xs text-slate-500 flex items-center justify-end gap-1"><UsersIcon className="w-3 h-3"/> Sign-ups</label>
                <p className="font-bold text-white text-lg">{clicks}</p>
            </div>
             <div>
                <label className="text-xs text-slate-500 flex items-center justify-end gap-1"><SparklesIcon className="w-3 h-3"/> Credits</label>
                <p className="font-bold text-white text-lg">{credits}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateCard;
