import React from 'react';
import { GitHubTreeItem } from '../types';

interface FileTreeProps {
  tree: GitHubTreeItem[];
  onFileSelect: (path: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ tree, onFileSelect }) => {
  // A simple list view is enough for now. A proper tree view is more complex.
  const files = tree.filter(item => item.type === 'blob');

  return (
    <div className="h-full bg-slate-800/50 p-2 overflow-y-auto">
      <h3 className="text-sm font-semibold text-slate-400 p-2">Files</h3>
      <ul>
        {files.map(item => (
          <li
            key={item.path}
            onClick={() => onFileSelect(item.path)}
            className="p-2 text-sm text-slate-300 rounded-md hover:bg-slate-700 cursor-pointer truncate"
          >
            {item.path}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default FileTree;
