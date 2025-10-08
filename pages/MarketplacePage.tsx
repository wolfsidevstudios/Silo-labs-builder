import React, { useState, useEffect } from 'react';
import { PublishedApp } from '../types';
import { getMarketplaceApps, getUserId, toggleLike, hasUserLikedApp } from '../services/firebaseService';
import HeartIcon from '../components/icons/HeartIcon';
import RocketIcon from '../components/icons/RocketIcon';
import UserIcon from '../components/icons/UserIcon';

interface MarketplacePageProps {
  onForkApp: (prompt: string, htmlContent: string, summary: string[]) => void;
}

const MarketplacePage: React.FC<MarketplacePageProps> = ({ onForkApp }) => {
  const [apps, setApps] = useState<PublishedApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState<Record<string, { count: number; userHasLiked: boolean }>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchApps = async () => {
      try {
        setIsLoading(true);
        const fetchedApps = await getMarketplaceApps();
        setApps(fetchedApps);
        
        const likesPromises = fetchedApps.map(async (app) => {
          const userHasLiked = await hasUserLikedApp(app.id, userId);
          return { [app.id]: { count: app.likes, userHasLiked } };
        });
        const likesResults = await Promise.all(likesPromises);
        setLikes(Object.assign({}, ...likesResults));

      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load marketplace apps.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchApps();
  }, [userId]);
  
  const handleLikeClick = async (appId: string) => {
    if (!userId) {
      alert("Please sign in to like apps.");
      return;
    }

    const currentLikeStatus = likes[appId] || { count: 0, userHasLiked: false };
    
    // Optimistic UI update
    setLikes(prev => ({
        ...prev,
        [appId]: {
            count: currentLikeStatus.userHasLiked ? currentLikeStatus.count - 1 : currentLikeStatus.count + 1,
            userHasLiked: !currentLikeStatus.userHasLiked,
        }
    }));

    try {
        const newLikesCount = await toggleLike(appId, userId, currentLikeStatus.userHasLiked);
        // Sync with server state
        setLikes(prev => ({ ...prev, [appId]: { ...prev[appId], count: newLikesCount } }));
    } catch (error) {
        console.error("Failed to update like", error);
        // Revert UI on error
        setLikes(prev => ({ ...prev, [appId]: currentLikeStatus }));
    }
  };


  return (
    <div className="min-h-screen w-screen bg-black flex flex-col p-4 pl-[4.5rem] selection:bg-indigo-500 selection:text-white">
      <main className="w-full max-w-7xl mx-auto px-4 animate-fade-in-up">
        <div className="text-center md:text-left mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-200 via-white to-gray-400 text-transparent bg-clip-text">
            Community Marketplace
          </h1>
          <p className="text-lg text-slate-400 mt-2">
            Discover, fork, and share AI-generated web applications.
          </p>
        </div>

        {isLoading && <div className="text-center text-slate-400">Loading creations...</div>}
        {error && <div className="text-center text-red-400">{error}</div>}
        
        {!isLoading && !error && apps.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
            <h2 className="text-2xl font-semibold text-slate-300">The Marketplace is Empty</h2>
            <p className="text-slate-500 mt-2">
              Be the first to publish an app from the builder!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {apps.map((app, index) => (
            <div
              key={app.id}
              className="relative bg-slate-900 border border-slate-700 rounded-lg overflow-hidden group transition-all hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 animate-fade-in-up flex flex-col"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="aspect-[16/10] bg-slate-800">
                <iframe
                  srcDoc={app.previewHtml}
                  title={app.prompt}
                  sandbox="allow-scripts"
                  scrolling="no"
                  className="w-full h-full transform scale-[1] origin-top-left bg-white pointer-events-none"
                />
              </div>
              
              <div className="flex flex-col justify-between flex-grow p-4">
                <div>
                    <p className="font-semibold text-slate-100 truncate text-sm" title={app.prompt}>
                        {app.prompt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                        {app.authorAvatarUrl ? (
                            <img src={app.authorAvatarUrl} alt={app.authorUsername} className="w-4 h-4 rounded-full" />
                        ) : (
                            <UserIcon className="w-4 h-4" />
                        )}
                        <span>{app.authorUsername || 'Anonymous'}</span>
                    </div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                    <button 
                        onClick={() => onForkApp(app.prompt, app.htmlContent, app.summary)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-indigo-300 hover:bg-white/10 transition-colors"
                    >
                        <RocketIcon className="w-4 h-4" />
                        Fork
                    </button>
                    <button 
                        onClick={() => handleLikeClick(app.id)}
                        className="flex items-center gap-2 text-slate-400 hover:text-pink-500 transition-colors"
                    >
                       <HeartIcon className={`w-5 h-5 ${likes[app.id]?.userHasLiked ? 'text-pink-500 fill-current' : ''}`} />
                       <span className="text-sm font-semibold">{likes[app.id]?.count ?? 0}</span>
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default MarketplacePage;