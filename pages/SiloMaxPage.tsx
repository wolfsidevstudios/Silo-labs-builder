import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import ArrowUpIcon from '../components/icons/ArrowUpIcon';
import BotIcon from '../components/icons/BotIcon';
import BrainCircuitIcon from '../components/icons/BrainCircuitIcon';
import UserSearchIcon from '../components/icons/UserSearchIcon';
import CodeBlock from '../components/CodeBlock';
// FIX: Import PersonalInfo from types.ts
import { PersonalInfo } from '../types';
import { getPersonalInfo } from '../services/personalInfoService';

interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { uri: string; title: string }[];
}

const bookHotelFunctionDeclaration: FunctionDeclaration = {
  name: 'bookHotel',
  parameters: {
    type: Type.OBJECT,
    description: 'Books a hotel for the user.',
    properties: {
      hotelName: { type: Type.STRING, description: 'The name of the hotel.' },
      checkInDate: { type: Type.STRING, description: 'The check-in date in YYYY-MM-DD format.' },
      checkOutDate: { type: Type.STRING, description: 'The check-out date in YYYY-MM-DD format.' },
      guests: { type: Type.NUMBER, description: 'Number of guests.' },
    },
    required: ['hotelName', 'checkInDate', 'checkOutDate', 'guests'],
  },
};

const orderGroceriesFunctionDeclaration: FunctionDeclaration = {
  name: 'orderGroceries',
  parameters: {
    type: Type.OBJECT,
    description: 'Orders groceries for the user from a specified store.',
    properties: {
      store: { type: Type.STRING, description: 'The name of the grocery store.' },
      items: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: 'A list of grocery items to order.' 
      },
    },
    required: ['store', 'items'],
  },
};

const SiloMaxPage: React.FC = () => {
  const [mode, setMode] = useState<'selection' | 'agent'>('selection');
  
  // Agent State
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('https://www.google.com/search?igu=1');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    if (promptInputRef.current) {
      const textarea = promptInputRef.current;
      textarea.style.height = 'auto';
      const maxHeight = 224; // max-h-56
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  }, [prompt]);

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentPrompt = prompt.trim();
    if (!currentPrompt || isLoading) return;

    const userMessage: AgentChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: currentPrompt,
    };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key not found.");
      const ai = new GoogleGenAI({ apiKey });

      const personalInfo = getPersonalInfo();
      const personalInfoContext = personalInfo 
        ? `Here is the user's personal information for performing tasks: ${JSON.stringify(personalInfo)}.` 
        : "The user has not provided any personal information.";

      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const model = ai.models.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: `You are a helpful personal assistant named MAX. You can browse the web using Google Search and perform tasks like booking hotels or ordering groceries. ${personalInfoContext}`,
          tools: [{ googleSearch: {} }, { functionDeclarations: [bookHotelFunctionDeclaration, orderGroceriesFunctionDeclaration] }],
        }
      });
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(currentPrompt);
      const response = result.response;
      
      const functionCalls = response.functionCalls;
      
      if (functionCalls) {
        // For this demo, we'll just confirm the action was taken. A real app would execute the function.
        const functionResponses = functionCalls.map(fc => {
            let resultMessage = '';
            if (fc.name === 'bookHotel') {
                resultMessage = `Hotel "${fc.args.hotelName}" booked successfully.`;
                alert(`SIMULATION: Hotel "${fc.args.hotelName}" booked for ${fc.args.guests} guest(s) from ${fc.args.checkInDate} to ${fc.args.checkOutDate}. Personal info used: ${JSON.stringify(personalInfo)}`);
            } else if (fc.name === 'orderGroceries') {
                resultMessage = `Groceries from "${fc.args.store}" have been ordered.`;
                 alert(`SIMULATION: Ordering groceries from ${fc.args.store}. Items: ${(fc.args.items as string[]).join(', ')}. Personal info used: ${JSON.stringify(personalInfo)}`);
            }
            return {
                functionResponse: {
                    name: fc.name,
                    response: { result: resultMessage },
                }
            };
        });

        const secondResult = await chat.sendMessage(JSON.stringify(functionResponses));
        const finalResponse = secondResult.response;
        setMessages(prev => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', content: finalResponse.text }]);

      } else {
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks?.map(c => c.web) || [];
        setMessages(prev => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', content: response.text, sources: sources as any }]);

        if (groundingMetadata?.webSearchQueries?.[0]) {
            setIframeUrl(`https://www.google.com/search?q=${encodeURIComponent(groundingMetadata.webSearchQueries[0])}`);
        } else {
            setIframeUrl('https://www.google.com/search?igu=1');
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setMessages(prev => [...prev, { id: `error-${Date.now()}`, role: 'assistant', content: `Error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'selection') {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center p-4 pl-[4.5rem]">
        <h1 className="text-8xl md:text-9xl font-['Orbitron'] bg-gradient-to-r from-slate-200 via-white to-slate-400 text-transparent bg-clip-text mb-16">SILO MAX</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
            <div onClick={() => alert('The original MAX chat is now part of the Builder page. Click the "MAX" button to start an analysis.')} className="p-8 bg-slate-900 border border-slate-700 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all hover:border-indigo-500 hover:-translate-y-1">
                <BrainCircuitIcon className="w-16 h-16 text-indigo-400 mb-4" />
                <h2 className="text-2xl font-bold text-white">MAX Chat</h2>
                <p className="text-slate-400 mt-2">Open-ended conversation and code generation. (Now integrated into the Builder page)</p>
            </div>
            <div onClick={() => setMode('agent')} className="p-8 bg-slate-900 border border-slate-700 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all hover:border-indigo-500 hover:-translate-y-1">
                <UserSearchIcon className="w-16 h-16 text-indigo-400 mb-4" />
                <h2 className="text-2xl font-bold text-white">Personal Agent</h2>
                <p className="text-slate-400 mt-2">An agent that can browse the web and perform tasks on your behalf.</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black text-white flex pl-[4.5rem]">
      <div className="flex-grow h-full p-4">
        <iframe src={iframeUrl} className="w-full h-full rounded-xl border border-slate-800" title="Web Browser"></iframe>
      </div>
      <div className="w-full max-w-md h-full flex flex-col bg-slate-900/50 backdrop-blur-md border-l border-white/10 rounded-l-2xl">
        <div ref={chatContainerRef} className="flex-grow p-6 space-y-6 overflow-y-auto">
          {messages.map(message => (
            <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center">
                  <BotIcon className="w-5 h-5 text-indigo-300" />
                </div>
              )}
              <div className={`p-3 rounded-xl max-w-sm ${message.role === 'user' ? 'bg-white text-black' : 'bg-white/5'}`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 border-t border-white/20 pt-3">
                    <p className="text-xs font-semibold text-slate-400 mb-2">Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.sources.map((source, index) => (
                        <a key={index} href={source.uri} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs hover:bg-slate-600/50 truncate">
                          {source.title || new URL(source.uri).hostname}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-white/10">
          <form onSubmit={handleAgentSubmit} className="relative">
            <textarea
              ref={promptInputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Book a hotel in Paris for 2 nights..."
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAgentSubmit(e); } }}
              disabled={isLoading}
              className="w-full min-h-[56px] max-h-56 p-4 pr-16 bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="absolute h-12 w-12 right-2 top-1/2 -translate-y-1/2 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:bg-gray-600 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-black rounded-full animate-spin"></div>
              ) : (
                <ArrowUpIcon className="w-5 h-5 text-black" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SiloMaxPage;