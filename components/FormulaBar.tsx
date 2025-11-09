
import React, { useState, useEffect, useRef } from 'react';
import { SelectionArea } from '../types';

interface FormulaBarProps {
  selectionArea: SelectionArea;
  value: string;
  onValueChange: (value: string) => void;
  selectionCountText: string | null;
}

// Common Excel formulas for tooltip
const FORMULA_HINTS: { [key: string]: string } = {
  'SUM': 'SUM(number1, [number2], ...) - Adds all the numbers in a range of cells',
  'AVERAGE': 'AVERAGE(number1, [number2], ...) - Returns the average of the arguments',
  'COUNT': 'COUNT(value1, [value2], ...) - Counts the number of cells that contain numbers',
  'MAX': 'MAX(number1, [number2], ...) - Returns the largest value in a set of values',
  'MIN': 'MIN(number1, [number2], ...) - Returns the smallest value in a set of values',
  'IF': 'IF(logical_test, value_if_true, [value_if_false]) - Returns one value if condition is TRUE, another if FALSE',
  'VLOOKUP': 'VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
  'HLOOKUP': 'HLOOKUP(lookup_value, table_array, row_index_num, [range_lookup])',
  'CONCATENATE': 'CONCATENATE(text1, [text2], ...) - Joins several text items into one',
  'LEFT': 'LEFT(text, [num_chars]) - Returns the leftmost characters from a text value',
  'RIGHT': 'RIGHT(text, [num_chars]) - Returns the rightmost characters from a text value',
  'MID': 'MID(text, start_num, num_chars) - Returns characters from the middle of text',
};

export const FormulaBar: React.FC<FormulaBarProps> = ({ selectionArea, value, onValueChange, selectionCountText }) => {
  const [inputValue, setInputValue] = useState(value);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const { row, col } = selectionArea.start;
  const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Check if user is typing a formula and show hint
    if (newValue.startsWith('=')) {
      const formulaPart = newValue.slice(1).toUpperCase();
      const currentFormula = formulaPart.split('(')[0];

      if (FORMULA_HINTS[currentFormula]) {
        setTooltipContent(FORMULA_HINTS[currentFormula]);
        setShowTooltip(true);
      } else {
        setShowTooltip(false);
      }
    } else {
      setShowTooltip(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onValueChange(inputValue);
      e.currentTarget.blur();
      setShowTooltip(false);
    } else if (e.key === 'Escape') {
      setInputValue(value);
      e.currentTarget.blur();
      setShowTooltip(false);
    }
  };

  const handleBlur = () => {
    onValueChange(inputValue);
    setTimeout(() => setShowTooltip(false), 200);
  };

  // Highlight cell references in formulas
  const renderHighlightedFormula = () => {
    if (!inputValue.startsWith('=')) {
      return inputValue;
    }

    const cellRefPattern = /([A-Z]+[0-9]+)/g;
    const parts = inputValue.split(cellRefPattern);
    const colors = ['#4285f4', '#ea4335', '#fbbc04', '#34a853', '#ff6d01', '#46bdc6'];
    let colorIndex = 0;

    return parts.map((part, index) => {
      if (cellRefPattern.test(part)) {
        const color = colors[colorIndex % colors.length];
        colorIndex++;
        return (
          <span key={index} style={{ color, fontWeight: 'bold' }}>
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-3 py-1.5 flex items-center space-x-3 text-sm relative">
      <div className="w-16 text-center font-mono text-xs text-gray-500 border border-gray-300 rounded-sm bg-white py-1">
        {cellId}
      </div>

      {selectionCountText && (
         <div className="text-xs text-gray-500 pr-3 border-r border-gray-300">
          {selectionCountText}
        </div>
      )}

      <div className="flex-grow relative">
        <div className="flex items-center bg-white border border-gray-300 rounded-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <span className="italic text-gray-400 pl-2 pr-1 font-mono text-xs">fx</span>
          <div className="flex-grow relative border-l border-gray-200">
            {/* Highlighted formula display (behind input) */}
            <div
              className="absolute inset-0 p-1 pointer-events-none whitespace-nowrap overflow-hidden"
              style={{
                color: inputValue.startsWith('=') ? 'transparent' : 'inherit',
                zIndex: inputValue.startsWith('=') ? 1 : -1
              }}
            >
              {renderHighlightedFormula()}
            </div>
            {/* Actual input */}
            <input
              ref={inputRef}
              type="text"
              className="w-full p-1 h-full bg-transparent outline-none relative z-10"
              style={{ color: inputValue.startsWith('=') ? 'transparent' : 'inherit' }}
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onFocus={() => {
                if (inputValue.startsWith('=')) {
                  const formulaPart = inputValue.slice(1).toUpperCase();
                  const currentFormula = formulaPart.split('(')[0];
                  if (FORMULA_HINTS[currentFormula]) {
                    setTooltipContent(FORMULA_HINTS[currentFormula]);
                    setShowTooltip(true);
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Tooltip for formula hints */}
        {showTooltip && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-gray-900 text-white text-xs p-2 rounded shadow-lg max-w-md">
            {tooltipContent}
          </div>
        )}
      </div>
    </div>
  );
};
