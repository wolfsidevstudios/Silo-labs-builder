import React from 'react';
import { Version, SavedProject } from '../types';
import HistoryIcon from './icons/HistoryIcon';
import XIcon from './icons/XIcon';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: SavedProject | null;
  onRestore: (version: Version) => void;
}

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ isOpen, onClose, project, onRestore }) => {
  if (!isOpen || !project) return null;

  const history = project.history || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl m-4 w-full max-w-2xl h-[80vh] flex flex-col transform transition-transform duration-300 scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HistoryIcon className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Project Version History</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
            <XIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <div className="flex-grow p-6 overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center text-slate-500 py-20">
              No version history found for this project.
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-4 h-full w-0.5 bg-slate-700" aria-hidden="true" />
              <ul className="space-y-8">
                {history.map((version, index) => (
                  <li key={version.versionId} className="relative pl-12">
                    <div className="absolute left-4 top-1.5 -translate-x-1/2 w-3 h-3 bg-slate-500 rounded-full ring-4 ring-slate-800" />
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-slate-400">
                                    {new Date(version.createdAt).toLocaleString()}
                                    {index === 0 && <span className="ml-3 bg-green-900 text-green-300 text-xs font-semibold px-2 py-0.5 rounded-full">Latest</span>}
                                </p>
                                <p className="mt-2 text-slate-200 italic">"{version.prompt}"</p>
                            </div>
                            <button 
                                onClick={() => onRestore(version)}
                                disabled={index === 0}
                                className="px-4 py-1.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                            >
                                Restore
                            </button>
                        </div>
                    </div>
                  </li>
                ))}
              </ul>
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

export default VersionHistoryModal;
