import React from 'react';

interface CodeEditorProps {
  content: string;
  onContentChange: (newContent: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ content, onContentChange }) => {
  return (
    <div className="h-full bg-slate-900 rounded-lg overflow-hidden">
      <textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        className="w-full h-full p-4 bg-transparent text-slate-200 font-mono text-sm resize-none focus:outline-none"
        spellCheck="false"
      />
    </div>
  );
};
export default CodeEditor;
