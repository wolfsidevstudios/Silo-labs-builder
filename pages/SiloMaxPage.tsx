import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, FunctionDeclaration, Type, GenerateContentResponse } from "@google/genai";
import ArrowUpIcon from '../components/icons/ArrowUpIcon';
import BotIcon from '../components/icons/BotIcon';
import BrainCircuitIcon from '../components/icons/BrainCircuitIcon';
import UserSearchIcon from '../components/icons/UserSearchIcon';
import CodeBlock from '../components/CodeBlock';
import { PersonalInfo } from '../types';
import { getPersonalInfo } from '../services/personalInfoService';
import { generateMaxChatStream } from '../services/geminiService';

interface ChatMessage {
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
  const [activeMode, setActiveMode] = useState<'agent' | 'chat'>('agent');

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col pl-[4.5rem]">
      <div className="flex-shrink-0 flex justify-center py-4">
        <div className="bg-slate-900/50 p-1 rounded-full flex items-center border border-slate-700/50">
          <button
            onClick={() => setActiveMode('agent')}
            className={`px-6 py-1.5 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${activeMode === 'agent' ? 'bg-white text-black' : 'text-slate-300'}`}
          >
            <UserSearchIcon className="w-4 h-4" /> Personal Agent
          </button>
          <button
            onClick={() => setActiveMode('chat')}
            className={`px-6 py-1.5 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${activeMode === 'chat' ? 'bg-white text-black' : 'text-slate-300'}`}
          >
            <BrainCircuitIcon className="w-4 h-4" /> MAX Chat
          </button>
        </div>
      </div>
      <div className="flex-grow min-h-0">
        {activeMode === 'agent' ? <AgentMode /> : <ChatMode />}
      </div>
    </div>
  );
};

const AgentMode: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('https://www.google.com/search?igu=1');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (promptInputRef.current) {
      const textarea = promptInputRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 224)}px`;
    }
  }, [prompt]);

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentPrompt = prompt.trim();
    if (!currentPrompt || isLoading) return;

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: currentPrompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key not found.");
      const ai = new GoogleGenAI({ apiKey });

      const personalInfo = getPersonalInfo();
      const personalInfoContext = personalInfo ? `Here is the user's personal information for performing tasks: ${JSON.stringify(personalInfo)}.` : "The user has not provided any personal information.";

      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }));

      const processResponse = async (response: GenerateContentResponse) => {
        const functionCalls = response.functionCalls;
        if (functionCalls) {
          const functionResponses = functionCalls.map(fc => {
            let resultMessage = '';
            if (fc.name === 'bookHotel') {
              resultMessage = `Hotel "${fc.args.hotelName}" booked successfully.`;
              alert(`SIMULATION: Hotel "${fc.args.hotelName}" booked for ${fc.args.guests} guest(s) from ${fc.args.checkInDate} to ${fc.args.checkOutDate}.\nPersonal info that would be used: ${JSON.stringify(personalInfo)}`);
            } else if (fc.name === 'orderGroceries') {
              resultMessage = `Groceries from "${fc.args.store}" have been ordered.`;
              alert(`SIMULATION: Ordering groceries from ${fc.args.store}. Items: ${(fc.args.items as string[]).join(', ')}.\nPersonal info that would be used: ${JSON.stringify(personalInfo)}`);
            }
            return { functionResponse: { name: fc.name, response: { result: resultMessage } } };
          });

          const followupResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [...history, { role: 'user', parts: [{ text: currentPrompt }] }, { role: 'model', parts: [{ functionCall: functionCalls[0] }] }, { role: 'user', parts: functionResponses.map(fr => ({ functionResponse: fr.functionResponse })) }],
            config: { systemInstruction: `You are a helpful personal assistant named MAX. You can browse the web using Google Search and perform tasks like booking hotels or ordering groceries. ${personalInfoContext}`, tools: [{ googleSearch: {} }, { functionDeclarations: [bookHotelFunctionDeclaration, orderGroceriesFunctionDeclaration] }] },
          });
          processResponse(followupResponse);
        } else {
          const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
          const sources = groundingMetadata?.groundingChunks?.map(c => c.web) || [];
          setMessages(prev => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', content: response.text, sources: sources as any }]);
          if (groundingMetadata?.webSearchQueries?.[0]) {
            setIframeUrl(`https://www.google.com/search?q=${encodeURIComponent(groundingMetadata.webSearchQueries[0])}`);
          }
        }
      };
      
      const initialResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [...history, { role: 'user', parts: [{ text: currentPrompt }] }],
        config: { systemInstruction: `You are a helpful personal assistant named MAX. You can browse the web using Google Search and perform tasks like booking hotels or ordering groceries. ${personalInfoContext}`, tools: [{ googleSearch: {} }, { functionDeclarations: [bookHotelFunctionDeclaration, orderGroceriesFunctionDeclaration] }] },
      });
      await processResponse(initialResponse);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setMessages(prev => [...prev, { id: `error-${Date.now()}`, role: 'assistant', content: `Error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex">
      <div className="flex-grow h-full p-4 pl-0 pb-0">
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
            <button type="submit" disabled={isLoading || !prompt.trim()} className="absolute h-12 w-12 right-2 top-1/2 -translate-y-1/2 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:bg-gray-600 group">
              {isLoading ? <div className="w-5 h-5 border-2 border-t-transparent border-black rounded-full animate-spin"></div> : <ArrowUpIcon className="w-5 h-5 text-black" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const ChatMode: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const currentPrompt = prompt.trim();
        if (!currentPrompt || isLoading) return;

        const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: currentPrompt };
        const assistantId = `assistant-${Date.now()}`;
        const assistantMessage: ChatMessage = { id: assistantId, role: 'assistant', content: '' };

        setMessages(prev => [...prev, userMessage, assistantMessage]);
        setPrompt('');
        setIsLoading(true);

        try {
            const stream = generateMaxChatStream(currentPrompt);
            for await (const chunk of stream) {
                setMessages(prev => prev.map(msg => msg.id === assistantId ? { ...msg, content: msg.content + chunk } : msg));
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            setMessages(prev => prev.map(msg => msg.id === assistantId ? { ...msg, content: `Error: ${errorMessage}` } : msg));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
            <div className="flex-grow overflow-y-auto p-4 space-y-6">
                {messages.map((message) => {
                    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
                    const parts = message.content.split(codeBlockRegex);
                    
                    return (
                        <div key={message.id} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                            {message.role === 'assistant' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-500/30 flex items-center justify-center">
                                    <BrainCircuitIcon className="w-5 h-5 text-indigo-300" />
                                </div>
                            )}
                            <div className={`p-4 rounded-xl max-w-2xl ${message.role === 'user' ? 'bg-white text-black' : 'bg-white/5'}`}>
                                {parts.map((part, index) => {
                                    if (index % 3 === 2) { // This is the code content
                                        const lang = parts[index - 1] || 'jsx';
                                        return <CodeBlock key={index} language={lang} code={part.trim()} />;
                                    } else if (index % 3 === 0) { // This is regular text
                                        return part && <p key={index} className="whitespace-pre-wrap">{part}</p>;
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    );
                })}
                <div ref={endOfMessagesRef} />
            </div>
             <div className="p-4">
                <form onSubmit={handleChatSubmit} className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask MAX anything..."
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSubmit(e); } }}
                        disabled={isLoading}
                        className="w-full min-h-[56px] max-h-56 p-4 pr-16 bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                    />
                    <button type="submit" disabled={isLoading || !prompt.trim()} className="absolute h-12 w-12 right-2 top-1/2 -translate-y-1/2 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:bg-gray-600 group">
                        {isLoading ? <div className="w-5 h-5 border-2 border-t-transparent border-black rounded-full animate-spin"></div> : <ArrowUpIcon className="w-5 h-5 text-black" />}
                    </button>
                </form>
            </div>
        </div>
    );
};


export default SiloMaxPage;