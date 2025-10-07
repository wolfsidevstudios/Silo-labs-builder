import React from 'react';
import RocketIcon from './icons/RocketIcon';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
}

const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, onPublish }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 m-4 max-w-lg w-full transform transition-transform duration-300 scale-95 animate-scale-in text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 -mt-16 mb-6">
            <RocketIcon className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Publish to Marketplace</h2>
        <p className="text-slate-400 mt-4">
          Are you ready to share your creation with the community? Your app's prompt and code will be visible to everyone.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onPublish}
            className="px-6 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            Publish App
          </button>
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

export default PublishModal;