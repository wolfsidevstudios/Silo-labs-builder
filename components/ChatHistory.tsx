
import React, { useEffect, useRef } from 'react';
import CheckIcon from './icons/CheckIcon';
import { ChatMessage } from '../types';

interface ChatHistoryProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isLoading, error }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, error]);

  const showInitialPlaceholder = messages.length === 0 && !isLoading && !error;

  return (
    <div className="flex-grow p-4 overflow-y-auto space-y-6">
      {showInitialPlaceholder && (
        <div className="flex-grow flex items-center justify-center h-full">
          <p className="text-slate-500">Your conversation with the AI will appear here.</p>
        </div>
      )}

      {messages.map((message, index) => (
        <div key={index}>
          {message.role === 'user' ? (
            <div className="flex flex-col items-start">
                <div className="bg-slate-700 text-white p-3 rounded-lg max-w-xl">
                    <p className="font-semibold text-sm mb-1 text-indigo-300">You</p>
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
              <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg w-full max-w-xl animate-fade-in-up">
                <p className="font-semibold text-sm mb-2 text-indigo-300">AI Plan</p>
                <ul className="list-disc list-inside space-y-1 text-slate-300 mb-4 pl-2">
                  {message.content.summary.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <div className="bg-slate-900/50 border border-slate-600 rounded-md p-3">
                  <p className="font-semibold text-sm mb-3 text-slate-400">Updated Files</p>
                  <div className="space-y-2">
                    {message.content.files.map((file, index) => (
                      <div
                        key={file.path}
                        className="flex items-center gap-3 text-sm"
                      >
                        <CheckIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <span className="font-mono text-slate-300">{file.path}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex flex-col items-start">
          <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg inline-flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-t-transparent border-indigo-400 rounded-full animate-spin"></div>
            <p className="text-slate-300">Thinking...</p>
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