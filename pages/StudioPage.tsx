import React, { useState, useEffect, useRef } from 'react';
import { StudioChatMessage, StudioUserMessage, StudioAssistantMessage } from '../types';
import { chatWithStudioAgent } from '../services/geminiService';
import ArrowUpIcon from '../components/icons/ArrowUpIcon';
import RocketIcon from '../components/icons/RocketIcon';

interface StudioPageProps {
  onGenerate: (prompt: string) => void;
}

const ChatBubble: React.FC<{ message: StudioChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    return (
        <div className={`flex w-full animate-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl shadow-md ${isUser ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
            </div>
        </div>
    );
};

const StudioPage: React.FC<StudioPageProps> = ({ onGenerate }) => {
  const [messages, setMessages] = useState<StudioChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState<string | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'assistant-init',
        role: 'assistant',
        content: "Hello! I'm your Creative Studio Agent. I can help you brainstorm and create a detailed prompt for our Builder AI. What kind of application would you like to build today?"
      }
    ]);
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, finalPrompt]);
  
  const extractFinalPrompt = (content: string): string | null => {
      const match = content.match(/```prompt\n([\s\S]+?)\n```/);
      return match ? match[1].trim() : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || finalPrompt) return;

    const newUserMessage: StudioUserMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
    };

    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const history: { role: 'user' | 'model'; parts: { text: string }[] }[] = newMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const aiResponse = await chatWithStudioAgent(history);
      
      const extractedPrompt = extractFinalPrompt(aiResponse);

      if (extractedPrompt) {
          setFinalPrompt(extractedPrompt);
          const newAssistantMessage: StudioAssistantMessage = {
             id: `assistant-${Date.now()}`,
             role: 'assistant',
             content: "Great! I've prepared the final prompt based on our conversation. You can review it below and send it to the builder."
          };
          setMessages(prev => [...prev, newAssistantMessage]);
      } else {
          const newAssistantMessage: StudioAssistantMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: aiResponse,
          };
          setMessages(prev => [...prev, newAssistantMessage]);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      const errorAssistantMessage: StudioAssistantMessage = {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`
      };
      setMessages(prev => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-black flex flex-col items-center p-4 pl-20 selection:bg-indigo-500 selection:text-white overflow-y-hidden">
      <main className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-2rem)] px-4">
        <div className="flex-shrink-0 text-center py-8">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-200 via-white to-gray-400 text-transparent bg-clip-text mb-4 animate-fade-in-down">
                Creative Studio
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto animate-fade-in-down" style={{animationDelay: '0.2s'}}>
                Chat with an AI agent to brainstorm and create a detailed prompt for your app.
            </p>
        </div>

        <div className="flex-grow bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl shadow-black/20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {/* Chat history */}
            <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                {messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="px-5 py-3 rounded-2xl bg-slate-700">
                             <div className="flex items-center justify-center gap-2">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                )}
                 {finalPrompt && (
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 my-6 animate-fade-in-up">
                        <h3 className="text-lg font-bold text-indigo-400 mb-3">Final Prompt Ready</h3>
                        <p className="bg-slate-900 p-4 rounded-md text-slate-300 whitespace-pre-wrap">{finalPrompt}</p>
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => onGenerate(finalPrompt)}
                                className="inline-flex items-center gap-3 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full text-md transition-all transform hover:scale-105"
                            >
                                <RocketIcon className="w-5 h-5" />
                                Build App with This Prompt
                            </button>
                        </div>
                    </div>
                )}
                <div ref={endOfMessagesRef} />
            </div>
            
            <div className="flex-shrink-0 p-4 border-t border-slate-800/50 bg-slate-900/20">
                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={finalPrompt ? "Your prompt is ready! Send it to the builder." : "Chat with the agent..."}
                        className="w-full h-14 p-4 pr-16 bg-white/[0.05] border border-white/10 rounded-full text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                        disabled={isLoading || !!finalPrompt}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim() || !!finalPrompt}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed group"
                        aria-label="Send message"
                    >
                        <ArrowUpIcon className="w-5 h-5 text-black" />
                    </button>
                </form>
            </div>
        </div>
      </main>
      <style>{`
          .animate-fade-in-down { animation: fade-in-down 0.6s ease-out forwards; } 
          .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; } 
          @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } } 
          @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default StudioPage;