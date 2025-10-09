import React, { useState } from 'react';
import SiloMaxModalBase from './SiloMaxModalBase';

interface SiloMaxWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWebsite: (url: string) => void;
}

const SiloMaxWebsiteModal: React.FC<SiloMaxWebsiteModalProps> = ({ isOpen, onClose, onAddWebsite }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAddWebsite(url.trim());
      setUrl('');
    }
  };

  return (
    <SiloMaxModalBase isOpen={isOpen} onClose={onClose} title="Add Website URL">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-400">Enter a website URL to add it to the context.</p>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full p-3 bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
          autoFocus
        />
        <div className="flex justify-end">
          <button type="submit" className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
            Add Website
          </button>
        </div>
      </form>
    </SiloMaxModalBase>
  );
};

export default SiloMaxWebsiteModal;
