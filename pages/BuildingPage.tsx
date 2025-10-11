import React, { useState, useEffect, useRef } from 'react';
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
  const progressRef = useRef(0);

  useEffect(() => {
    let progressInterval: ReturnType<typeof setInterval> | undefined;

    const buildApp = async () => {
      setStatusText('Initializing build process...');
      progressRef.current = 0;
      setProgress(0);

      // Start a smooth progress interval to give a sense of real-time progress
      progressInterval = setInterval(() => {
        // Increment progress but slow down as it gets closer to 90
        const increment = progressRef.current < 70 ? Math.random() * 3 : Math.random();
        progressRef.current += increment;
        if (progressRef.current > 95) {
          progressRef.current = 95;
          if (progressInterval) clearInterval(progressInterval);
        }
        setProgress(progressRef.current);
      }, 250);

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
        
        for await (const update of stream) {
            if (update.error) throw new Error(update.error);
            if (update.finalResponse) {
                finalResponse = update.finalResponse;
                break;
            }
            if(update.summary && update.summary.length > 0) {
              const newStatus = update.summary[update.summary.length - 1];
              setStatusText(newStatus);
            }
        }

        if (!finalResponse) {
            throw new Error("Build process completed without a valid result.");
        }
        
        if (progressInterval) clearInterval(progressInterval);
        setProgress(100);
        setStatusText('Finalizing build...');
        setIsFinished(true);

        setTimeout(() => {
            onBuildComplete(finalResponse!);
        }, 1500);

      } catch (err) {
        if (progressInterval) clearInterval(progressInterval);
        setStatusText(err instanceof Error ? `Error: ${err.message}` : "An unknown error occurred.");
      }
    };

    buildApp();

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    }
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
                <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                    <div
                        className="bg-white h-4 rounded-full transition-all duration-300 ease-linear"
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