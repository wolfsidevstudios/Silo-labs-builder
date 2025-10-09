import React, { useState } from 'react';
import SiloMaxModalBase from './SiloMaxModalBase';

interface SiloMaxVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVideo: (url: string) => void;
}

const SiloMaxVideoModal: React.FC<SiloMaxVideoModalProps> = ({ isOpen, onClose, onAddVideo }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAddVideo(url.trim());
      setUrl('');
    }
  };

  return (
    <SiloMaxModalBase isOpen={isOpen} onClose={onClose} title="Add Video URL">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-400">Enter a URL from a video platform like YouTube or Vimeo.</p>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
          autoFocus
        />
        <div className="flex justify-end">
          <button type="submit" className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
            Add Video
          </button>
        </div>
      </form>
    </SiloMaxModalBase>
  );
};

export default SiloMaxVideoModal;
