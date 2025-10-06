import React, { useState, useEffect, useRef } from 'react';
import { FreeSound } from '../types';
import { searchFreeSound, getApiKey } from '../services/freesoundService';

interface FreeSoundSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSound: (sound: FreeSound) => void;
}

const AudioPlayer: React.FC<{ src: string }> = ({ src }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="absolute top-2 right-2">
            <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} preload="metadata" />
            <button onClick={togglePlay} className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-indigo-600">
                {isPlaying ? '❚❚' : '▶'}
            </button>
        </div>
    );
};

const FreeSoundSearchModal: React.FC<FreeSoundSearchModalProps> = ({ isOpen, onClose, onSelectSound }) => {
  const [query, setQuery] = useState('ui click');
  const [results, setResults] = useState<FreeSound[]>([]);
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
        const apiKey = getApiKey();
        if (!apiKey) throw new Error("FreeSound API Key not found.");
        const sounds = await searchFreeSound(apiKey, trimmedQuery);
        setResults(sounds);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search for sounds.");
      } finally {
        setIsLoading(false);
      }
    };
    
    performSearch();

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
          <form onSubmit={(e) => { e.preventDefault(); setQuery(e.currentTarget.search.value) }} className="flex gap-2">
            <input
              name="search"
              defaultValue={query}
              placeholder="Search for sound effects on FreeSound..."
              className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500">Search</button>
          </form>
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto">
          {isLoading && <div className="text-center text-slate-400">Loading...</div>}
          {error && <div className="text-center text-red-400">{error}</div>}
          {!isLoading && !error && (
            <div className="space-y-3">
              {results.map(sound => (
                <div
                  key={sound.id}
                  onClick={() => onSelectSound(sound)}
                  className="group bg-slate-800/50 hover:bg-slate-700/50 p-4 rounded-lg cursor-pointer relative flex justify-between items-center transition-colors"
                >
                  <div>
                    <p className="font-semibold text-slate-200 truncate">{sound.name}</p>
                    <p className="text-xs text-slate-400">by {sound.username}</p>
                  </div>
                   <AudioPlayer src={sound.previews['preview-hq-mp3']} />
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

export default FreeSoundSearchModal;
