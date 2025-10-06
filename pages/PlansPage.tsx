import React, { useState, useEffect } from 'react';
import CheckIcon from '../components/icons/CheckIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import GiftIcon from '../components/icons/GiftIcon';

const PRO_PAYMENT_URL = "https://buy.polar.sh/polar_cl_gu9SqU1tuhJ6PoQT2oUCgUpt6UjCc2NTbyOIC3QDDKb?redirect_url=" + encodeURIComponent(window.location.origin + "?upgraded=true");

const PlansPage: React.FC = () => {
  const [copyText, setCopyText] = useState('Copy URL');
  const [affiliateUrl, setAffiliateUrl] = useState('');

  useEffect(() => {
    let affiliateId = localStorage.getItem('user_affiliate_id');
    if (!affiliateId) {
      // Generate a simple unique ID
      affiliateId = 'ref' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('user_affiliate_id', affiliateId);
    }
    setAffiliateUrl(`https://silo-labs-builder.vercel.app/?ref=${affiliateId}`);
  }, []);

  const handleCopy = () => {
    if (!affiliateUrl) return;

    navigator.clipboard.writeText(affiliateUrl).then(() => {
      setCopyText('Copied!');
      setTimeout(() => setCopyText('Copy URL'), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <div className="min-h-screen w-screen bg-black flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white pl-20">
      <main className="w-full max-w-5xl px-4 animate-fade-in-up">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-200 via-white to-gray-400 text-transparent bg-clip-text mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Select the plan that best fits your needs. Unlock more power and features as you grow.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 flex flex-col">
            <h2 className="text-2xl font-semibold text-white">Free</h2>
            <p className="text-4xl font-bold my-4">$0 <span className="text-lg font-normal text-slate-400">/ month</span></p>
            <p className="text-slate-400 mb-6 h-12">For individuals and hobbyists starting out.</p>
            <ul className="space-y-3 text-slate-300 flex-grow">
              <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> 30 monthly generations</li>
              <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Access to all AI models</li>
              <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Community support</li>
            </ul>
            <button className="mt-8 w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors">
              Current Plan
            </button>
          </div>

          {/* Pro Plan - Highlighted */}
          <div className="bg-white/[0.05] backdrop-blur-2xl border-2 border-indigo-500 rounded-2xl p-8 flex flex-col relative shadow-2xl shadow-indigo-500/20 transform md:scale-105">
            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Most Popular</span>
            </div>
            <h2 className="text-2xl font-semibold text-white">Pro</h2>
            <p className="text-4xl font-bold my-4">$5 <span className="text-lg font-normal text-slate-400">/ month</span></p>
            <p className="text-slate-400 mb-6 h-12">For professionals and small teams building serious projects.</p>
            <ul className="space-y-3 text-slate-300 flex-grow">
              <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Unlimited generations</li>
              <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Download project code</li>
              <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Save projects</li>
              <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Use custom secrets</li>
              <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Priority support</li>
            </ul>
             <a href={PRO_PAYMENT_URL} className="mt-8 text-center w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all transform hover:scale-105">
              Upgrade to Pro
            </a>
          </div>

          {/* Ultra Plan */}
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 flex flex-col">
            <h2 className="text-2xl font-semibold text-white">Ultra</h2>
            <p className="text-4xl font-bold my-4">$10 <span className="text-lg font-normal text-slate-400">/ month</span></p>
            <p className="text-slate-400 mb-6 h-12">For large teams and enterprises needing maximum power.</p>
            <ul className="space-y-3 text-slate-300 flex-grow">
              <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Everything in Pro</li>
              <li className="flex items-center gap-3"><SparklesIcon className="w-5 h-5 text-purple-400" /> Team collaboration (soon)</li>
              <li className="flex items-center gap-3"><SparklesIcon className="w-5 h-5 text-purple-400" /> Dedicated support (soon)</li>
              <li className="flex items-center gap-3"><SparklesIcon className="w-5 h-5 text-purple-400" /> And much more...</li>
            </ul>
             <button disabled className="mt-8 text-center w-full px-6 py-3 bg-slate-700 text-slate-400 font-semibold rounded-lg cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>

        {/* Affiliate Program Section */}
        <div className="mt-20 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
                <div className="hidden sm:block">
                    <GiftIcon className="w-16 h-16 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-2xl font-semibold text-white">Affiliate Program</h3>
                    <p className="text-slate-400 mt-2 max-w-lg">Share your unique tracking URL to get <strong>1 free generation</strong> per sign-up. Soon, you'll also earn <strong>10% cash back</strong> every time a referred user buys premium!</p>
                </div>
            </div>
            <div className="relative w-full md:w-auto md:min-w-[420px]">
              <div 
                title={affiliateUrl}
                className="w-full p-3 pr-28 bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-full shadow-inner shadow-black/20 text-indigo-300 font-mono text-sm truncate pl-5"
              >
                  {affiliateUrl || 'Generating...'}
              </div>
              <button
                  onClick={handleCopy}
                  disabled={!affiliateUrl}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full transition-colors text-sm disabled:bg-slate-600 disabled:cursor-not-allowed"
              >
                  {copyText}
              </button>
            </div>
        </div>
      </main>
      <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PlansPage;