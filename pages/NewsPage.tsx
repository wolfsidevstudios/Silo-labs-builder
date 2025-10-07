import React, { useState } from 'react';
import { NEWS_ITEMS } from '../data/news';
import GiftIcon from '../components/icons/GiftIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import ZapIcon from '../components/icons/ZapIcon';

const NewsPage: React.FC = () => {
  const [view, setView] = useState<'timeline' | 'announcements'>('announcements');

  return (
    <div className="min-h-screen w-screen bg-black flex flex-col items-center p-4 pl-[4.5rem] selection:bg-indigo-500 selection:text-white overflow-y-auto">
      <main className="w-full max-w-5xl px-4 py-12">
        <div className="text-center mb-12 animate-fade-in-down">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-200 via-white to-gray-400 text-transparent bg-clip-text mb-4">
            News & Updates
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Stay up-to-date with the latest features, improvements, and announcements.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex justify-center mb-12">
            <div className="bg-slate-900/50 p-1 rounded-full flex items-center border border-slate-700/50">
                <button
                    onClick={() => setView('announcements')}
                    className={`px-6 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                        view === 'announcements' ? 'bg-white text-black' : 'text-slate-300 hover:bg-slate-700/50'
                    }`}
                >
                    Announcements
                </button>
                <button
                    onClick={() => setView('timeline')}
                    className={`px-6 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                        view === 'timeline' ? 'bg-white text-black' : 'text-slate-300 hover:bg-slate-700/50'
                    }`}
                >
                    Timeline
                </button>
            </div>
        </div>
        
        {view === 'announcements' && (
          <div className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-3xl font-bold text-slate-100 mb-6 text-center">What's New</h2>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-indigo-500/30 rounded-2xl p-8 shadow-2xl shadow-indigo-500/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="md:col-span-2 border-b border-slate-700 pb-8">
                   <div className="flex items-center gap-3 mb-3">
                      <GiftIcon className="w-7 h-7 text-indigo-400" />
                      <h3 className="text-2xl font-bold text-white">Free Pro Week For Everyone!</h3>
                  </div>
                  <p className="text-slate-400">
                      As a thank you to our amazing community, every user now gets a free 7-day trial of all Pro features! Explore saving projects, one-click deployments with Netlify, GitHub integration, custom themes, and more. Your free week starts now!
                  </p>
                </div>
                <div>
                   <div className="flex items-center gap-3 mb-3">
                      <ZapIcon className="w-7 h-7 text-indigo-400" />
                      <h3 className="text-2xl font-bold text-white">Intelligent Integrations</h3>
                  </div>
                  <p className="text-slate-400">
                      Connect your Giphy or Gemini keys and the AI can build apps that use them automatically, no extra prompting required.
                  </p>
                </div>
                <div>
                   <div className="flex items-center gap-3 mb-3">
                      <SparklesIcon className="w-7 h-7 text-indigo-400" />
                      <h3 className="text-2xl font-bold text-white">UI Themes & Custom Secrets</h3>
                  </div>
                  <p className="text-slate-400">
                      Guide the AI with pre-defined design systems and securely use your own API keys for third-party services in your generated apps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'timeline' && (
          <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-slate-800" aria-hidden="true"></div>
            
            {NEWS_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isLeft = index % 2 === 0;
              return (
                <div key={item.id} className={`relative flex items-center mb-12 ${isLeft ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-1/2 ${isLeft ? 'pr-8' : 'pl-8'}`}>
                    <div className={`bg-slate-800/50 border border-slate-700 p-6 rounded-lg shadow-lg text-left`}>
                      <p className="text-sm text-slate-500 mb-2">{item.date}</p>
                      <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                      <p className="text-slate-400">{item.content}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center ring-8 ring-black">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
      <style>{`
        @keyframes fade-in-down {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.6s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default NewsPage;
