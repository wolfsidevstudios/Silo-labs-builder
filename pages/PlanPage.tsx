import React, { useState, useEffect } from 'react';
import { AppPlan } from '../types';
import { generateAppPlan } from '../services/geminiService';
import HomePageBackground from '../components/HomePageBackground';
import ArrowUpIcon from '../components/icons/ArrowUpIcon';

interface PlanPageProps {
  initialPrompt: string;
  isLisaActive: boolean;
  revisedPrompt?: string;
  onApprove: (plan: AppPlan) => void;
  onDecline: (revision: string) => void;
  onGoHome: () => void;
}

const PlanPage: React.FC<PlanPageProps> = ({ initialPrompt, isLisaActive, revisedPrompt, onApprove, onDecline, onGoHome }) => {
  const [plan, setPlan] = useState<AppPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState('');

  useEffect(() => {
    const fetchPlan = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await generateAppPlan(initialPrompt, revisedPrompt);
        setPlan(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate plan.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlan();
  }, [initialPrompt, revisedPrompt]);
  
  const handleRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(revision.trim()) {
        onDecline(revision);
        setRevision('');
    }
  };

  const PlanSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
    <div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <ul className="space-y-2 list-disc list-inside text-slate-300">
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </div>
  );

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      <HomePageBackground />
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-between p-4 selection:bg-indigo-500 selection:text-white pl-[4.5rem]">
        <div />
        <main className="w-full max-w-4xl bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 overflow-y-auto animate-fade-in-up">
          {isLoading && (
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-300">Generating your app's blueprint...</p>
            </div>
          )}
          {error && <div className="text-center text-red-400">{error}</div>}
          {plan && !isLoading && (
            <>
              <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-200 via-white to-gray-400 text-transparent bg-clip-text mb-8">
                The AI's Plan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <PlanSection title="Features" items={plan.features} />
                <PlanSection title="Design Details" items={plan.designDetails} />
                <PlanSection title="Pages / Sections" items={plan.pages} />
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Color Palette</h3>
                  <div className="flex flex-wrap gap-4">
                    {plan.colors.map((color, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: color.hex }} />
                        <div>
                          <p className="text-sm font-semibold text-white">{color.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{color.hex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
        
        <div className="w-full max-w-4xl space-y-4">
            <form onSubmit={handleRevisionSubmit} className="relative w-full max-w-2xl mx-auto">
                 <input
                    type="text"
                    value={revision}
                    onChange={(e) => setRevision(e.target.value)}
                    placeholder="e.g., Use a darker color palette..."
                    className="w-full min-h-[56px] py-4 px-6 pr-16 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button type="submit" className="absolute h-12 w-12 right-2 top-2 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:bg-gray-600 group">
                    <ArrowUpIcon className="w-6 h-6 text-black" />
                </button>
            </form>

            <div className="flex justify-center items-center gap-4">
                <button onClick={() => onDecline(revision)} className="px-8 py-3 bg-slate-700 text-white font-semibold rounded-full hover:bg-slate-600 transition-colors">
                    Decline & Revise
                </button>
                <button onClick={() => plan && onApprove(plan)} disabled={!plan || isLoading} className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                    Approve
                </button>
            </div>
        </div>

      </div>
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

export default PlanPage;
