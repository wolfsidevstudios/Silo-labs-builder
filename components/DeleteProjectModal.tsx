import React from 'react';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({ isOpen, onClose, onConfirm, projectName }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-red-700/50 rounded-2xl shadow-2xl p-8 m-4 max-w-md w-full transform transition-transform duration-300 scale-95 animate-scale-in text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 mb-4">
            <AlertTriangleIcon className="h-6 w-6 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-white">Delete Project</h3>
        <p className="mt-2 text-sm text-slate-400">
          Are you sure you want to permanently delete the project "{projectName}"? This action cannot be undone.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
          >
            Delete
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

export default DeleteProjectModal;
