import React, { useEffect } from 'react';
import NetlifyIcon from './icons/NetlifyIcon';
import CheckIcon from './icons/CheckIcon';
import RocketIcon from './icons/RocketIcon';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: () => void;
  status: 'idle' | 'deploying' | 'success' | 'error';
  siteUrl: string | null;
  isNewDeploy: boolean;
  isGitBased?: boolean;
}

const DeployModal: React.FC<DeployModalProps> = ({ isOpen, onClose, onDeploy, status, siteUrl, isNewDeploy, isGitBased = false }) => {
  useEffect(() => {
    // Automatically start deployment for new web apps as they don't need a confirmation step
    if (isOpen && isNewDeploy && !isGitBased && status === 'idle') {
        onDeploy();
    }
  }, [isOpen, isNewDeploy, isGitBased, status, onDeploy]);

  if (!isOpen) return null;

  const renderContent = () => {
    // For an existing project OR a new Git-based project, show a confirmation first.
    if (status === 'idle' && (!isNewDeploy || isGitBased)) {
      return (
        <>
            <div className="flex items-center gap-3 mb-4">
                <NetlifyIcon className="h-7 w-7" />
                <h2 className="text-2xl font-bold text-white">{isNewDeploy ? 'Deploy to Netlify' : 'Redeploy Project'}</h2>
            </div>
            <p className="text-slate-400 mb-6">
                {isNewDeploy
                    ? "This will create a new Netlify site from your connected GitHub repository and trigger the first build."
                    : `Your project is live at the URL below. Click redeploy to push your latest changes from GitHub.`
                }
            </p>
            {!isNewDeploy && siteUrl && (
                <div className="bg-slate-900/50 p-3 rounded-lg text-center mb-6">
                    <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 font-mono break-all hover:underline">{siteUrl}</a>
                </div>
            )}
             <div className="mt-8 flex justify-end gap-4">
                <button onClick={onClose} className="px-5 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">Cancel</button>
                <button onClick={onDeploy} className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">{isNewDeploy ? 'Deploy' : 'Redeploy'}</button>
            </div>
        </>
      );
    }
    
    switch (status) {
      case 'deploying':
      case 'idle': // idle for a new deploy means we start deploying immediately
        return (
          <div className="text-center">
            <div className="flex justify-center items-center mb-6">
                 <RocketIcon className="w-12 h-12 text-indigo-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white">Deploying...</h2>
            <p className="text-slate-400 mt-2">Your app is being uploaded to Netlify. This may take a moment.</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center">
             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-600/20 mb-6">
                <CheckIcon className="h-6 w-6 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">{isGitBased ? 'Build Triggered!' : 'Deployment Successful!'}</h2>
            <p className="text-slate-400 mt-2 mb-6">
              {isGitBased 
                ? isNewDeploy 
                  ? "Your site is being created and the first build is in progress. It will be live at the URL below shortly."
                  : "A new build has been triggered from your repository's latest commit. Your changes will be live shortly."
                : "Your app is now live. You can view it at the URL below."}
            </p>
            <div className="bg-slate-900/50 p-3 rounded-lg">
                <a href={siteUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-indigo-400 font-mono break-all hover:underline">{siteUrl}</a>
            </div>
            <button onClick={onClose} className="mt-8 px-8 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">Close</button>
          </div>
        );
      case 'error':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400">Deployment Failed</h2>
            <p className="text-slate-400 mt-2">Something went wrong. Please check your token and try again.</p>
            <button onClick={onClose} className="mt-8 px-8 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">Close</button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 m-4 max-w-lg w-full transform transition-transform duration-300 scale-95 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="absolute inset-0 -z-10 swirl-background"></div>
        {renderContent()}
      </div>
      <style>{`
        .swirl-background {
            background-image: radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.1) 0px, transparent 50%),
                              radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.1) 0px, transparent 50%),
                              radial-gradient(at 52% 99%, hsla(355, 98%, 76%, 0.1) 0px, transparent 50%),
                              radial-gradient(at 10% 29%, hsla(256, 96%, 68%, 0.1) 0px, transparent 50%),
                              radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 0.1) 0px, transparent 50%),
                              radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 0.1) 0px, transparent 50%),
                              radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 0.1) 0px, transparent 50%);
        }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default DeployModal;