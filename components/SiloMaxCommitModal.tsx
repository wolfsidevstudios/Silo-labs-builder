import React, { useState } from 'react';
import SiloMaxModalBase from './SiloMaxModalBase';

interface SiloMaxCommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommit: (commitMessage: string) => void;
  filePath: string;
  repoName: string;
}

const SiloMaxCommitModal: React.FC<SiloMaxCommitModalProps> = ({ isOpen, onClose, onCommit, filePath, repoName }) => {
  const [commitMessage, setCommitMessage] = useState(`feat: Update ${filePath} via Silo MAX`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commitMessage.trim()) {
      onCommit(commitMessage.trim());
    }
  };

  return (
    <SiloMaxModalBase isOpen={isOpen} onClose={onClose} title="Commit Changes">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-400">
          Enter a commit message for your changes to <span className="font-mono text-indigo-400">{filePath}</span> in the repository <span className="font-mono text-indigo-400">{repoName}</span>.
        </p>
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Your commit message..."
          className="w-full h-24 p-3 bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
          autoFocus
        />
        <div className="flex justify-end">
          <button type="submit" className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
            Commit Changes
          </button>
        </div>
      </form>
    </SiloMaxModalBase>
  );
};

export default SiloMaxCommitModal;
