import React, { useState } from 'react';
import AlertTriangleIcon from './icons/AlertTriangleIcon';
import { DataCategory } from '../types';

interface DeleteDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (categories: DataCategory[]) => void;
}

const dataCategories: { id: DataCategory; name: string; description: string }[] = [
  { id: 'projects', name: 'Saved Projects', description: 'All your locally saved app creations.' },
  { id: 'images', name: 'Image Library', description: "Images you've uploaded to your local library." },
  { id: 'keys', name: 'API Keys & Secrets', description: 'All connected third-party API keys and custom secrets.' },
  { id: 'settings', name: 'Application Settings', description: 'UI themes, AI model preferences, and other configurations.' },
];

const DeleteDataModal: React.FC<DeleteDataModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [selectedCategories, setSelectedCategories] = useState<Set<DataCategory>>(new Set());

  if (!isOpen) return null;

  const handleToggle = (categoryId: DataCategory) => {
    const newSelection = new Set(selectedCategories);
    if (newSelection.has(categoryId)) {
      newSelection.delete(categoryId);
    } else {
      newSelection.add(categoryId);
    }
    setSelectedCategories(newSelection);
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedCategories));
  };

  const isAllSelected = selectedCategories.size === dataCategories.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(dataCategories.map(c => c.id)));
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-red-700/50 rounded-2xl shadow-2xl p-8 m-4 max-w-lg w-full transform transition-transform duration-300 scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50">
            <AlertTriangleIcon className="h-6 w-6 text-red-400" />
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-bold text-white">Manage & Delete App Data</h3>
            <p className="mt-1 text-sm text-slate-400">
              Select the data categories you wish to permanently delete from your browser. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
            {dataCategories.map(category => (
                <div key={category.id} onClick={() => handleToggle(category.id)} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg cursor-pointer border border-transparent hover:border-slate-600">
                    <input 
                        type="checkbox" 
                        checked={selectedCategories.has(category.id)}
                        readOnly
                        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div>
                        <p className="font-semibold text-slate-200">{category.name}</p>
                        <p className="text-sm text-slate-500">{category.description}</p>

                    </div>
                </div>
            ))}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center">
                <input
                    id="select-all"
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="select-all" className="ml-2 text-sm text-slate-400 cursor-pointer">Select All</label>
            </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedCategories.size === 0}
            className="px-6 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:bg-red-900/50 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            Delete Selected ({selectedCategories.size})
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

export default DeleteDataModal;
