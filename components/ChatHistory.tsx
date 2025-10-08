import React, { useEffect, useRef } from 'react';
import CheckIcon from './icons/CheckIcon';
import MaxReportCard from './MaxReportCard';
import { ChatMessage, MaxIssue } from '../types';

interface ChatHistoryProps {
  messages: ChatMessage[];
  error: string | null;
  onAutoFix: (issues: MaxIssue[]) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, error, onAutoFix }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, error]);

  const showInitialPlaceholder = messages.length === 0 && !error;

  return (
    <div className="flex-grow p-4 overflow-y-auto space-y-6">
      {showInitialPlaceholder && (
        <div className="flex-grow flex items-center justify-center h-full">
          <p className="text-slate-500">Your conversation with the AI will appear here.</p>
        </div>
      )}

      {messages.map((message) => (
        <div key={message.id}>
          {message.role === 'user' ? (
            <div className="flex flex-col items-end">
                <div className="bg-white text-slate-900 p-3 rounded-xl max-w-xl shadow-md">
                    <p className="font-semibold text-sm mb-1 text-indigo-600">You</p>
                    {message.imagePreviewUrls && message.imagePreviewUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {message.imagePreviewUrls.map((url, i) => (
                                <img key={i} src={url} alt={`User upload ${i + 1}`} className="rounded-md max-h-32 object-cover" />
                            ))}
                        </div>
                    )}
                    {message.content && <p>{message.content}</p>}
                </div>
            </div>
          ) : (
            <div className="flex flex-col items-start w-full">
                {message.maxReport ? (
                    <MaxReportCard report={message.maxReport} onAutoFix={onAutoFix} />
                ) : (
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-4 rounded-xl w-full max-w-xl animate-fade-in-up shadow-2xl shadow-black/20">
                        <p className="font-semibold text-sm mb-2 text-indigo-300">AI Plan</p>
                        {message.content.summary && (
                        <ul className="list-disc list-inside space-y-1 text-slate-300 mb-4 pl-2">
                            {message.content.summary.map((item, index) => (
                            <li key={index}>{item}</li>
                            ))}
                        </ul>
                        )}
                        {message.content.files && message.content.files.length > 0 && (
                        <div className="bg-black/20 border border-white/10 rounded-md p-3">
                            <p className="font-semibold text-sm mb-3 text-slate-400">Files to be updated</p>
                            <div className="space-y-2">
                            {message.content.files.map((file) => (
                                <div key={file.path} className="flex items-center gap-3 text-sm">
                                {message.isGenerating ? (
                                    <div className="w-5 h-5 border-2 border-t-transparent border-indigo-400 rounded-full animate-spin flex-shrink-0"></div>
                                ) : (
                                    <CheckIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                )}
                                <span className="font-mono text-slate-300">{file.path}</span>
                                </div>
                            ))}
                            </div>
                        </div>
                        )}
                    </div>
                )}
            </div>
          )}
        </div>
      ))}

      {error && (
        <div className="flex flex-col items-start">
          <div className="bg-red-800/50 border border-red-700 p-3 rounded-lg max-w-xl">
            <p className="font-semibold text-sm mb-1 text-red-300">Error</p>
            <p className="text-white">{error}</p>
          </div>
        </div>
      )}
      
      <div ref={endOfMessagesRef} />
      
      <style>{`
          @keyframes fade-in-up {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { 
              animation: fade-in-up 0.5s ease-out forwards;
          }
      `}</style>
    </div>
  );
};

export default ChatHistory;