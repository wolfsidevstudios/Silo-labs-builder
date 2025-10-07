import React, { useState, useEffect } from 'react';
import { YouTubeVideo } from '../types';
import { searchVideos, getApiKey } from '../services/youtubeService';

interface YouTubeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo: (videoId: string) => void;
}

const YouTubeSearchModal: React.FC<YouTubeSearchModalProps> = ({ isOpen, onClose, onSelectVideo }) => {
  const [query, setQuery] = useState('synthwave music');
  const [results, setResults] = useState<YouTubeVideo[]>([]);
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
        if (!apiKey) throw new Error("YouTube API key not found.");
        const videos = await searchVideos(apiKey, query);
        setResults(videos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search for videos.");
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
            placeholder="Search for videos on YouTube..."
            className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg shadow-inner placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto">
          {isLoading && <div className="text-center text-slate-400">Loading...</div>}
          {error && <div className="text-center text-red-400">{error}</div>}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {results.map(video => (
                <div
                  key={video.id.videoId}
                  onClick={() => onSelectVideo(video.id.videoId)}
                  className="group bg-slate-800 rounded-lg overflow-hidden cursor-pointer"
                >
                    <img
                        src={video.snippet.thumbnails.medium.url}
                        alt={video.snippet.title}
                        className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="p-3">
                        <h3 className="text-sm font-semibold text-white truncate group-hover:text-indigo-400" title={video.snippet.title}>{video.snippet.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">{video.snippet.channelTitle}</p>
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

export default YouTubeSearchModal;