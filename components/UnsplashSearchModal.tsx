import React, { useState, useEffect } from 'react';
import { UnsplashPhoto } from '../types';
import { searchPhotos, getAccessKey } from '../services/unsplashService';

interface UnsplashSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (photo: UnsplashPhoto) => void;
}

const UnsplashSearchModal: React.FC<UnsplashSearchModalProps> = ({ isOpen, onClose, onSelectPhoto }) => {
  const [query, setQuery] = useState('nature');
  const [results, setResults] = useState<UnsplashPhoto[]>([]);
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
        const accessKey = getAccessKey();
        if (!accessKey) throw new Error("Unsplash Access Key not found.");
        const photos = await searchPhotos(accessKey, trimmedQuery);
        setResults(photos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search for photos.");
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial search on open
    if (results.length === 0) {
      performSearch();
    }
    
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
            placeholder="Search for photos on Unsplash..."
            className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto">
          {isLoading && <div className="text-center text-slate-400">Loading...</div>}
          {error && <div className="text-center text-red-400">{error}</div>}
          {!isLoading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {results.map(photo => (
                <div
                  key={photo.id}
                  onClick={() => onSelectPhoto(photo)}
                  className="group aspect-[3/4] bg-slate-800 rounded-lg overflow-hidden cursor-pointer relative"
                >
                  <img
                    src={photo.urls.small}
                    alt={photo.alt_description || 'Unsplash photo'}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={photo.user.links.html} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-white/80 hover:text-white hover:underline truncate">{photo.user.name}</a>
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

export default UnsplashSearchModal;
