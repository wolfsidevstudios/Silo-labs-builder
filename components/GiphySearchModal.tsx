import React, { useState, useEffect } from 'react';
import { GiphyGif } from '../types';
import { searchGifs, getApiKey } from '../services/giphyService';

interface GiphySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (gif: GiphyGif) => void;
}

const GiphySearchModal: React.FC<GiphySearchModalProps> = ({ isOpen, onClose, onSelectGif }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GiphyGif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error("Giphy API key not found.");
        const gifs = await searchGifs(apiKey, query);
        setResults(gifs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search for GIFs.");
      } finally {
        setIsLoading(false);
      }
    };
    
    const debounceTimeout = setTimeout(performSearch, 500);
    return () => clearTimeout(debounceTimeout);

  }, [query, isOpen]);
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl m-4 w-full max-w-4xl h-[80vh] flex flex-col transform transition-transform duration-300 scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 p-4 border-b border-slate-700">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for GIFs on Giphy..."
            className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto">
          {isLoading && <div className="text-center text-slate-400">Loading...</div>}
          {error && <div className="text-center text-red-400">{error}</div>}
          {!isLoading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map(gif => (
                <div
                  key={gif.id}
                  onClick={() => onSelectGif(gif)}
                  className="group aspect-square bg-slate-800 rounded-lg overflow-hidden cursor-pointer"
                >
                  <img
                    src={gif.images.fixed_width.webp || gif.images.fixed_width.url}
                    alt={gif.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
       <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default GiphySearchModal;
