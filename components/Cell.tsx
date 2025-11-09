
import React, { useState, useEffect, useRef } from 'react';
import { CellData } from '../types';

interface CellProps {
  data: CellData;
  isSelected: boolean;
  isEditing: boolean;
  isMerged: boolean;
  onMouseDown: () => void;
  onMouseOver: () => void;
  onDoubleClick: () => void;
  onUpdate: (value: string) => void;
  colSpan?: number;
  rowSpan?: number;
}

export const Cell: React.FC<CellProps> = ({
  data,
  isSelected,
  isEditing,
  isMerged,
  onMouseDown,
  onMouseOver,
  onDoubleClick,
  onUpdate,
  colSpan = 1,
  rowSpan = 1,
}) => {
  const { value, format } = data || { value: '' };
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);
  
  const handleBlur = () => {
    onUpdate(inputValue);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onUpdate(inputValue);
    } else if (e.key === 'Escape') {
      setInputValue(value); // Revert changes
      onUpdate(value);
    }
  };
  
  const cellStyle: React.CSSProperties = {};
  if (colSpan > 1) cellStyle.gridColumn = `span ${colSpan}`;
  if (rowSpan > 1) cellStyle.gridRow = `span ${rowSpan}`;
  
  const contentStyle: React.CSSProperties = {
    fontWeight: format?.bold ? 'bold' : 'normal',
    fontStyle: format?.italic ? 'italic' : 'normal',
    textDecoration: format?.underline ? 'underline' : 'none',
    color: format?.textColor || '#000000',
    fontFamily: format?.fontFamily || 'Calibri',
    fontSize: format?.fontSize ? `${format.fontSize}px` : '12px',
    textAlign: format?.textAlign || 'left',
    width: '100%',
  };

  const classes = ['p-1', 'truncate', 'cursor-cell', 'flex'];

  // Vertical alignment
  switch (format?.verticalAlign) {
    case 'top': classes.push('items-start'); break;
    case 'bottom': classes.push('items-end'); break;
    case 'middle':
    default:
      classes.push('items-center'); break;
  }

  // Border / Selection outline
  if (isSelected) {
    classes.push('ring-2', 'ring-blue-500', 'z-10', 'relative');
  } else {
    classes.push('border-r', 'border-b', 'border-gray-200');
  }

  // Set base background color
  if (format?.backgroundColor) {
    cellStyle.backgroundColor = format.backgroundColor;
  } else if (isMerged) {
    classes.push('bg-gray-50');
  } else {
    classes.push('bg-white');
  }

  // Apply selection highlight overlay
  if (isSelected) {
    // This uses a semi-transparent overlay to ensure selection is visible
    // even on cells with a custom background color.
    // The color is similar to Tailwind's blue-200 with some transparency.
    cellStyle.boxShadow = `inset 0 0 0 9999px rgba(191, 219, 254, 0.7)`;
  }


  return (
    <div
      className={classes.join(' ')}
      onMouseDown={onMouseDown}
      onMouseOver={onMouseOver}
      onDoubleClick={onDoubleClick}
      style={cellStyle}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full h-full p-0 m-0 border-none outline-none bg-transparent"
          style={contentStyle}
        />
      ) : (
        <span style={contentStyle}>{value}</span>
      )}
    </div>
  );
};
