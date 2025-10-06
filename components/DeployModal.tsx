import React from 'react';
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
}

const DeployModal: React.FC<DeployModalProps> = ({ isOpen, onClose, onDeploy, status, siteUrl, isNewDeploy }) => {
  if (!isOpen) return null;

  const renderContent = () => {
    // For an existing project, show the URL and require a click to redeploy
    if (!isNewDeploy && status === 'idle') {
      return (
        <>
            <div className="flex items-center gap-3 mb-4">
                <NetlifyIcon className="h-7 w-7" />
                <h2 className="text-2xl font-bold text-white">Redeploy Project</h2>
            </div>
            <p className="text-slate-400 mb-6">Your project is live at the URL below. Click redeploy to push your latest changes.</p>
            <div className="bg-slate-900/50 p-3 rounded-lg text-center mb-6">
                <a href={siteUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-indigo-400 font-mono break-all hover:underline">{siteUrl}</a>
            </div>
             <div className="mt-8 flex justify-end gap-4">
                <button onClick={onClose} className="px-5 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">Cancel</button>
                <button onClick={onDeploy} className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">Redeploy</button>
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
            <h2 className="text-2xl font-bold text-white">Deployment Successful!</h2>
            <p className="text-slate-400 mt-2 mb-6">Your app is now live. You can view it at the URL below.</p>
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
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 m-4 max-w-lg w-full transform transition-transform duration-300 scale-95 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {renderContent()}
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

export default DeployModal;
