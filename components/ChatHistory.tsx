import React from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface ChatHistoryProps {
  prompt: string;
  isLoading: boolean;
  error: string | null;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ prompt, isLoading, error }) => {
  // Render nothing if there's no interaction yet
  if (!prompt && !isLoading && !error) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <p className="text-slate-500">Your conversation with the AI will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex-grow p-4 overflow-y-auto space-y-6">
      {prompt && (
        <div className="flex flex-col items-start">
          <div className="bg-slate-700 text-white p-3 rounded-lg max-w-xl">
            <p className="font-semibold text-sm mb-1 text-indigo-300">You</p>
            <p>{prompt}</p>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="flex flex-col items-start">
          <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg inline-flex items-center gap-3">
             <div className="w-5 h-5 border-2 border-t-transparent border-indigo-400 rounded-full animate-spin"></div>
            <p className="text-slate-300">Building your app...</p>
          </div>
        </div>
      )}
       {error && (
         <div className="flex flex-col items-start">
            <div className="bg-red-800/50 border border-red-700 p-3 rounded-lg max-w-xl">
                <p className="font-semibold text-sm mb-1 text-red-300">Error</p>
                <p className="text-white">{error}</p>
            </div>
         </div>
      )}
    </div>
  );
};

export default ChatHistory;
