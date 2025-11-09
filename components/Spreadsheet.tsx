
import React, { useState, useEffect, useRef } from 'react';
import { SheetData, SelectionArea, Merge } from '../types';
import { Cell } from './Cell';
import { LiveCursors } from './LiveCursors';
import { isCellSelected, findMergeForCell } from '../utils';
import { useCollaboration } from '../contexts/CollaborationContext';

interface SpreadsheetProps {
  sheetData: SheetData;
  selectionArea: SelectionArea;
  setSelectionArea: (area: SelectionArea) => void;
  updateCell: (row: number, col: number, value: string) => void;
  merges: Merge[];
  zoom?: number;
}

export const Spreadsheet: React.FC<SpreadsheetProps> = ({
  sheetData,
  selectionArea,
  setSelectionArea,
  updateCell,
  merges,
  zoom = 100,
}) => {
  const [editingCell, setEditingCell] = useState<SelectionArea['start'] | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const collaboration = useCollaboration();

  // Validate sheetData but don't return early (breaks React hooks)
  const isValidData = Array.isArray(sheetData) && sheetData.length > 0;

  // Calculate zoom scale
  const zoomScale = zoom / 100;

  useEffect(() => {
    if (!isValidData) {
      console.error('SheetData is not an array:', sheetData);
    }
  }, [isValidData, sheetData]);

  // Broadcast cursor position when selection changes
  useEffect(() => {
    if (collaboration.isConnected && !isSelecting) {
      collaboration.updateCursor(selectionArea.start.row, selectionArea.start.col);
    }
  }, [selectionArea.start.row, selectionArea.start.col, collaboration, isSelecting]);

  const rows = isValidData ? sheetData.length : 0;
  const cols = isValidData && sheetData[0] ? sheetData[0].length : 0;

  const handleMouseDown = (row: number, col: number) => {
    const merge = findMergeForCell(row, col, merges);
    const newSelection = merge ? { start: merge.start, end: merge.end } : { start: { row, col }, end: { row, col } };
    
    setSelectionArea(newSelection);
    setEditingCell(null);
    setIsSelecting(true);
  };

  const handleMouseOver = (row: number, col: number) => {
    if (isSelecting) {
      setSelectionArea(prev => ({ ...prev, end: { row, col } }));
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsSelecting(false);
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleDoubleClick = (row: number, col: number) => {
    const merge = findMergeForCell(row, col, merges);
    const targetCell = merge ? merge.start : {row, col};
    setEditingCell(targetCell);
    setSelectionArea({ start: targetCell, end: merge ? merge.end : targetCell });
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingCell) return;

      let { row, col } = selectionArea.start;
      const merge = findMergeForCell(row, col, merges);
      const targetCell = merge ? merge.start : { row, col };

      switch (e.key) {
        case 'ArrowUp': row = Math.max(0, row - 1); e.preventDefault(); break;
        case 'ArrowDown': row = Math.min(rows - 1, row + 1); e.preventDefault(); break;
        case 'ArrowLeft': col = Math.max(0, col - 1); e.preventDefault(); break;
        case 'ArrowRight': col = Math.min(cols - 1, col + 1); e.preventDefault(); break;
        case 'Enter': e.preventDefault(); setEditingCell(targetCell); break;
        case 'Tab':
            e.preventDefault();
            col = e.shiftKey ? Math.max(0, col - 1) : Math.min(cols - 1, col + 1);
            break;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            updateCell(targetCell.row, targetCell.col, e.key);
            setEditingCell(targetCell);
          }
          break;
      }
      const nextMerge = findMergeForCell(row, col, merges);
      const newSelection = nextMerge ? { start: nextMerge.start, end: nextMerge.end } : { start: { row, col }, end: { row, col } };
      setSelectionArea(newSelection);
    };

    const gridEl = gridRef.current;
    gridEl?.addEventListener('keydown', handleKeyDown);
    return () => gridEl?.removeEventListener('keydown', handleKeyDown);
  }, [selectionArea, editingCell, rows, cols, setSelectionArea, updateCell, merges]);

  const colHeaders = Array.from({ length: cols }, (_, i) => String.fromCharCode(65 + i));

  // Helper to check if row/col should be highlighted
  const isRowHighlighted = (rowIndex: number) => {
    const { start, end } = selectionArea;
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    return rowIndex >= minRow && rowIndex <= maxRow;
  };

  const isColHighlighted = (colIndex: number) => {
    const { start, end } = selectionArea;
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    return colIndex >= minCol && colIndex <= maxCol;
  };

  // Show error state if data is invalid
  if (!isValidData) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded">
        <p className="font-bold">Error: Invalid spreadsheet data</p>
        <p className="text-sm mt-2">Please clear localStorage and refresh the page.</p>
        <button
          onClick={() => {
            localStorage.removeItem('darevel-spreadsheet-data');
            window.location.reload();
          }}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Clear Data & Reload
        </button>
      </div>
    );
  }

  const cellWidth = 100 * zoomScale;
  const cellHeight = 24 * zoomScale;

  return (
    <div ref={gridRef} className="p-4 bg-gray-100 relative" tabIndex={0} onMouseLeave={() => setIsSelecting(false)}>
      {/* Live Cursors Overlay */}
      <LiveCursors cellWidth={cellWidth} cellHeight={cellHeight} />

      <div
        className="grid"
        style={{
          gridTemplateColumns: `${40 * zoomScale}px repeat(${cols}, minmax(${cellWidth}px, 1fr))`,
          gridTemplateRows: `${24 * zoomScale}px repeat(${rows}, ${cellHeight}px)`,
          fontSize: `${12 * zoomScale}px`,
        }}
      >
        {/* Corner cell */}
        <div className="sticky top-0 left-0 bg-gray-200 z-30 border-r border-b border-gray-300"></div>
        {/* Column headers */}
        {colHeaders.map((header, colIndex) => (
          <div
            key={colIndex}
            className={`sticky top-0 bg-gray-200 text-center font-semibold text-xs flex items-center justify-center border-r border-b border-gray-300 z-20 ${
              isColHighlighted(colIndex) ? 'highlight-col' : ''
            }`}
          >
            {header}
          </div>
        ))}
        {/* Row headers and cells */}
        {sheetData.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            <div
              className={`sticky left-0 bg-gray-200 text-center font-semibold text-xs flex items-center justify-center border-r border-b border-gray-300 z-20 ${
                isRowHighlighted(rowIndex) ? 'highlight-row' : ''
              }`}
            >
              {rowIndex + 1}
            </div>
            {row.map((cellData, colIndex) => {
              const mergeInfo = findMergeForCell(rowIndex, colIndex, merges);

              if (mergeInfo && (mergeInfo.start.row !== rowIndex || mergeInfo.start.col !== colIndex)) {
                return null; // This cell is hidden by a merge
              }

              let colSpan = 1, rowSpan = 1;
              if (mergeInfo) {
                colSpan = mergeInfo.end.col - mergeInfo.start.col + 1;
                rowSpan = mergeInfo.end.row - mergeInfo.start.row + 1;
              }

              return (
                <Cell
                  key={`${rowIndex}-${colIndex}`}
                  data={cellData}
                  isSelected={isCellSelected(rowIndex, colIndex, selectionArea, merges)}
                  isEditing={editingCell?.row === rowIndex && editingCell?.col === colIndex}
                  isMerged={!!mergeInfo}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
                  onDoubleClick={() => handleDoubleClick(rowIndex, colIndex)}
                  onUpdate={(value) => {
                    updateCell(rowIndex, colIndex, value);
                    setEditingCell(null);
                  }}
                  colSpan={colSpan}
                  rowSpan={rowSpan}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
