
import React, { useState, useEffect } from 'react';
import { SelectionArea } from '../types';

interface FormulaBarProps {
  selectionArea: SelectionArea;
  value: string;
  onValueChange: (value: string) => void;
  selectionCountText: string | null;
}

export const FormulaBar: React.FC<FormulaBarProps> = ({ selectionArea, value, onValueChange, selectionCountText }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const { row, col } = selectionArea.start;
  const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onValueChange(inputValue);
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setInputValue(value);
      e.currentTarget.blur();
    }
  };

  const handleBlur = () => {
    onValueChange(inputValue);
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-3 py-1.5 flex items-center space-x-3 text-sm">
      <div className="w-16 text-center font-mono text-xs text-gray-500 border border-gray-300 rounded-sm bg-white py-1">
        {cellId}
      </div>

      {selectionCountText && (
         <div className="text-xs text-gray-500 pr-3 border-r border-gray-300">
          {selectionCountText}
        </div>
      )}

      <div className="flex-grow flex items-center bg-white border border-gray-300 rounded-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <span className="italic text-gray-400 pl-2 pr-1 font-mono text-xs">fx</span>
        <input
          type="text"
          className="flex-grow p-1 h-full bg-transparent border-l border-gray-200 outline-none"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
};
