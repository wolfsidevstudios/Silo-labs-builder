import React, { useState, useEffect } from 'react';
import { PexelsMedia } from '../types';
import { searchPexels, getApiKey } from '../services/pexelsService';
import FilmIcon from './icons/FilmIcon';

interface PexelsSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (media: PexelsMedia) => void;
}

const PexelsSearchModal: React.FC<PexelsSearchModalProps> = ({ isOpen, onClose, onSelectMedia }) => {
  const [query, setQuery] = useState('coding');
  const [searchType, setSearchType] = useState<'photos' | 'videos'>('photos');
  const [results, setResults] = useState<PexelsMedia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const performSearch = async () => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const accessKey = getApiKey();
        if (!accessKey) throw new Error("Pexels API Key not found.");
        const media = await searchPexels(accessKey, trimmedQuery, searchType);
        setResults(media);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search for media.");
      } finally {
        setIsLoading(false);
      }
    };
    
    performSearch(); // Search immediately on open or type change

  }, [query, searchType, isOpen]);
  
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
        <div className="flex-shrink-0 p-4 border-b border-slate-700 flex items-center gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for photos and videos on Pexels..."
            className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
           <div className="bg-slate-800 p-1 rounded-full flex items-center">
                <button onClick={() => setSearchType('photos')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${searchType === 'photos' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>Photos</button>
                <button onClick={() => setSearchType('videos')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${searchType === 'videos' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}>Videos</button>
            </div>
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto">
          {isLoading && <div className="text-center text-slate-400">Loading...</div>}
          {error && <div className="text-center text-red-400">{error}</div>}
          {!isLoading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {results.map(media => (
                <div
                  key={media.id}
                  onClick={() => onSelectMedia(media)}
                  className="group aspect-video bg-slate-800 rounded-lg overflow-hidden cursor-pointer relative"
                >
                  <img
                    src={media.type === 'Photo' ? media.src.medium : (media as any).image} // Pexels video response has an `image` property for thumbnail
                    alt={media.type === 'Photo' ? (media as any).alt : 'Pexels video'}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {media.type === 'Video' && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <FilmIcon className="w-5 h-5 text-white" />
                        </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={media.photographer_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-white/80 hover:text-white hover:underline truncate">{media.photographer}</a>
                  </div>
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

export default PexelsSearchModal;
