import React, { useState, useEffect } from 'react';
import { AppPlan, AppMode, GeminiResponse } from '../types';
import { streamGenerateOrUpdateAppCode } from '../services/geminiService';
import CheckIcon from '../components/icons/CheckIcon';

interface BuildingPageProps {
  prompt: string;
  plan: AppPlan;
  isLisaActive: boolean;
  appMode: AppMode;
  revisedPrompt?: string;
  onBuildComplete: (response: GeminiResponse) => void;
}

const BuildingPage: React.FC<BuildingPageProps> = ({ prompt, plan, isLisaActive, appMode, revisedPrompt, onBuildComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Preparing to build...');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const buildApp = async () => {
      setStatusText('Generating application code...');
      
      const planContext = `
        Based on the user prompt, you must adhere to the following plan:
        - Features: ${plan.features.join(', ')}
        - Design Details: ${plan.designDetails.join(', ')}
        - Pages: ${plan.pages.join(', ')}
        - Colors: ${plan.colors.map(c => `${c.name} (${c.hex})`).join(', ')}
      `;

      const fullPrompt = revisedPrompt 
        ? `Original prompt: "${prompt}". User revision: "${revisedPrompt}".\n\n${planContext}`
        : `${prompt}\n\n${planContext}`;

      try {
        const stream = streamGenerateOrUpdateAppCode(fullPrompt, null, null, null, { model: isLisaActive ? 'gemini-2.5-pro' : 'gemini-2.5-flash' }, appMode);
        
        let finalResponse: GeminiResponse | null = null;
        const estimatedSize = 20000; // Estimate for progress calculation

        for await (const update of stream) {
            if (update.error) throw new Error(update.error);
            if (update.finalResponse) {
                finalResponse = update.finalResponse;
                break;
            }
            if (update.previewHtml) {
                const currentProgress = (update.previewHtml.length / estimatedSize) * 100;
                setProgress(Math.min(currentProgress, 99));
            }
            if(update.summary && update.summary.length > 0) {
              setStatusText(update.summary[0]);
            }
        }

        if (!finalResponse) {
            throw new Error("Build process completed without a valid result.");
        }

        setProgress(100);
        setStatusText('Finalizing build...');
        setIsFinished(true);

        setTimeout(() => {
            onBuildComplete(finalResponse!);
        }, 1500);

      } catch (err) {
        setStatusText(err instanceof Error ? `Error: ${err.message}` : "An unknown error occurred.");
        // Handle error state visually if needed
      }
    };

    buildApp();
  }, []);

  return (
    <div className="relative h-screen w-screen bg-black flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white pl-[4.5rem]">
      <div className="w-full max-w-2xl text-center">
        {isFinished ? (
            <div className="flex flex-col items-center justify-center gap-4 animate-fade-in">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckIcon className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mt-4">Finished!</h2>
                <p className="text-slate-400">Your app has been generated. Redirecting...</p>
            </div>
        ) : (
            <>
                <h2 className="text-3xl font-bold text-white mb-4">Building your app...</h2>
                <p className="text-slate-400 mb-8">{statusText}</p>
                <div className="w-full bg-slate-800 rounded-full h-4">
                    <div
                        className="bg-white h-4 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </>
        )}
      </div>
       <style>{`
        @keyframes fade-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default BuildingPage;
