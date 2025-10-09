import React, { useState, useEffect, useRef } from 'react';
import { TerminalLine } from '../types';
import TerminalIcon from './icons/TerminalIcon';

interface TerminalProps {
  lines: TerminalLine[];
  onCommand: (command: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const Terminal: React.FC<TerminalProps> = ({ lines, onCommand, inputRef }) => {
  const [inputValue, setInputValue] = useState('');
  const endOfLinesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLinesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onCommand(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
        <TerminalIcon className="w-5 h-5 text-slate-400" />
        <h2 className="font-semibold text-slate-300">Terminal</h2>
      </div>

      <div className="flex-grow p-4 overflow-y-auto font-mono text-sm text-slate-300 space-y-2" onClick={() => inputRef.current?.focus()}>
        {lines.map((line, index) => (
          <div key={index}>
            {line.type === 'command' ? (
              <div className="flex items-center">
                <span className="text-cyan-400 mr-2">$</span>
                <span>{line.text}</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{line.text}</div>
            )}
          </div>
        ))}
        <div ref={endOfLinesRef} />
      </div>

      <div className="flex-shrink-0 flex items-center p-2 bg-slate-800 border-t border-slate-700">
        <span className="text-cyan-400 font-mono text-sm mr-2">$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-slate-200 font-mono text-sm focus:outline-none"
          placeholder="Enter command..."
          autoFocus
        />
      </div>
    </div>
  );
};

export default Terminal;
