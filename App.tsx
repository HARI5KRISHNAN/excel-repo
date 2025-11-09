
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import useUndo from 'use-undo';
import { Spreadsheet } from './components/Spreadsheet';
import { AIPanel } from './components/AIPanel';
import { FormulaBar } from './components/FormulaBar';
import { Toolbar } from './components/Toolbar';
import { FileMenu } from './components/FileMenu';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { SheetData, SelectionArea, Merge, CellData, CellFormat } from './types';
import { generateData } from './services/ollamaService';
import { getNormalizedSelection, findMergeForCell, evaluateFormula } from './utils';
import { useTheme } from './contexts/ThemeContext';
import { versionHistory } from './services/versionHistory';


const INITIAL_ROWS = 50;
const INITIAL_COLS = 26; // A-Z

const App: React.FC = () => {
  const { theme, toggleTheme, zoom, setZoom } = useTheme();

  // Create a properly initialized empty sheet
  const createEmptySheet = (): SheetData => {
    return Array.from({ length: INITIAL_ROWS }, () =>
      Array.from({ length: INITIAL_COLS }, () => ({ value: '' }))
    );
  };

  // Validate and load data from localStorage with permanent protection
  const getInitialSheetData = (): SheetData => {
    try {
      const saved = localStorage.getItem('darevel-spreadsheet-data');

      // Handle null, undefined, or empty string
      if (!saved || saved === 'undefined' || saved === 'null') {
        console.warn('No valid localStorage data found. Starting with empty sheet.');
        localStorage.removeItem('darevel-spreadsheet-data');
        return createEmptySheet();
      }

      const parsed = JSON.parse(saved);

      // Validate structure: must be array of arrays with valid CellData objects
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(row => Array.isArray(row))) {
        // Ensure each row is an array and has proper CellData objects
        const validated = parsed.map((row: any) => {
          if (Array.isArray(row)) {
            return row.map((cell: any) => {
              // Ensure cell is an object with at least a value property
              if (typeof cell === 'object' && cell !== null && 'value' in cell) {
                return {
                  value: String(cell.value || ''),
                  formula: cell.formula,
                  format: cell.format
                };
              }
              // Fallback for old string-based cells or invalid data
              return { value: String(cell || '') };
            });
          }
          // Fallback for invalid rows
          return Array.from({ length: INITIAL_COLS }, () => ({ value: '' }));
        });

        // Final validation: ensure we actually got a valid array with valid structure
        if (Array.isArray(validated) && validated.length > 0 && validated.every(row => Array.isArray(row))) {
          console.log('Successfully loaded spreadsheet data from localStorage');
          return validated;
        }
      }

      // If validation failed, clear corrupted data
      console.warn('Invalid spreadsheet structure in localStorage. Resetting to empty sheet.');
      localStorage.removeItem('darevel-spreadsheet-data');

    } catch (error) {
      console.error('Failed to parse localStorage data:', error);
      // Clear corrupted data on any error (JSON parse errors, etc.)
      localStorage.removeItem('darevel-spreadsheet-data');
    }

    // Always return a valid empty sheet as fallback
    return createEmptySheet();
  };

  const getInitialMerges = (): Merge[] => {
    try {
      const saved = localStorage.getItem('darevel-spreadsheet-merges');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load merges from localStorage:', error);
    }
    return [];
  };

  // Use undo/redo for sheetData - with guaranteed valid initialization
  const initialSheetData = useMemo(() => {
    const initialData = getInitialSheetData();
    // Double-check the initial data is valid before passing to use-undo
    if (!Array.isArray(initialData) || initialData.length === 0) {
      console.warn('getInitialSheetData returned invalid data, using fallback');
      return createEmptySheet();
    }
    return initialData;
  }, []);

  const [sheetDataState, { set: setSheetData, undo, redo, canUndo, canRedo }] = useUndo<SheetData>(initialSheetData);
  const sheetData = sheetDataState.present;

  // Safety check: ensure sheetData is always valid (only on mount)
  useEffect(() => {
    if (!Array.isArray(sheetData) || sheetData.length === 0) {
      console.warn('Invalid sheetData detected after mount, resetting...', sheetData);
      localStorage.removeItem('darevel-spreadsheet-data');
      setSheetData(createEmptySheet());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectionArea, setSelectionArea] = useState<SelectionArea>({ start: { row: 0, col: 0 }, end: { row: 0, col: 0 } });
  const [merges, setMerges] = useState<Merge[]>(getInitialMerges());
  const [isAILoading, setIsAILoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const updateCell = useCallback((row: number, col: number, value: string) => {
    // Safety check: ensure sheetData is valid before processing
    if (!Array.isArray(sheetData) || sheetData.length === 0) {
      console.warn('Invalid sheetData in updateCell, using empty sheet');
      setSheetData(createEmptySheet());
      return;
    }

    let newData = sheetData.map(r => [...r]);

    // Dynamically expand grid if needed
    // Add rows if necessary
    while (newData.length <= row) {
      newData.push(Array.from({ length: newData[0]?.length || INITIAL_COLS }, () => ({ value: '' })));
    }

    // Add columns if necessary
    if (newData[0] && newData[0].length <= col) {
      const colsToAdd = col - newData[0].length + 1;
      newData = newData.map(r => [
        ...r,
        ...Array.from({ length: colsToAdd }, () => ({ value: '' }))
      ]);
    }

    const currentCell = newData[row]?.[col] || { value: '' };

    // Check if the value is a formula
    if (value.startsWith('=')) {
      try {
        // Evaluate the formula
        const evaluatedValue = evaluateFormula(value, sheetData);
        newData[row][col] = {
          ...currentCell,
          value: evaluatedValue,
          formula: value // Store the original formula
        };
      } catch (error) {
        // If formula evaluation fails, show error
        newData[row][col] = {
          ...currentCell,
          value: '#ERROR!',
          formula: value
        };
      }
    } else {
      // Regular value - clear any existing formula
      newData[row][col] = {
        ...currentCell,
        value,
        formula: undefined
      };
    }

    setSheetData(newData);
  }, [sheetData]);

  const applyFormatToSelection = useCallback((format: Partial<CellFormat>) => {
    // Safety check: ensure sheetData is valid before processing
    if (!Array.isArray(sheetData) || sheetData.length === 0) {
      console.warn('Invalid sheetData in applyFormatToSelection, using empty sheet');
      setSheetData(createEmptySheet());
      return;
    }

    let newData = sheetData.map(r => [...r]);
    const { minRow, maxRow, minCol, maxCol } = getNormalizedSelection(selectionArea);

    // Ensure grid is large enough for selection
    while (newData.length <= maxRow) {
      newData.push(Array.from({ length: newData[0]?.length || INITIAL_COLS }, () => ({ value: '' })));
    }

    if (newData[0] && newData[0].length <= maxCol) {
      const colsToAdd = maxCol - newData[0].length + 1;
      newData = newData.map(r => [
        ...r,
        ...Array.from({ length: colsToAdd }, () => ({ value: '' }))
      ]);
    }

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const currentCell = newData[r]?.[c] || { value: '' };
        const existingFormat = currentCell.format || {};
        newData[r][c] = {
          ...currentCell,
          format: { ...existingFormat, ...format },
        };
      }
    }

    setSheetData(newData);
  }, [selectionArea, sheetData]);
  
  const handleMergeCells = useCallback(() => {
    const { minRow, maxRow, minCol, maxCol } = getNormalizedSelection(selectionArea);

    const newMerge = {
      start: { row: minRow, col: minCol },
      end: { row: maxRow, col: maxCol },
    };

    // Remove any existing merges that overlap with the new one.
    const nonOverlappingMerges = merges.filter(m => {
      const overlaps =
        m.start.row <= maxRow && m.end.row >= minRow &&
        m.start.col <= maxCol && m.end.col >= minCol;
      return !overlaps;
    });

    setMerges([...nonOverlappingMerges, newMerge]);

    // Safety check: ensure sheetData is valid before processing
    if (!Array.isArray(sheetData) || sheetData.length === 0) {
      console.warn('Invalid sheetData in handleMergeCells, using empty sheet');
      setSheetData(createEmptySheet());
      return;
    }

    // Preserve top-left cell object, clear others
    const cellToKeep = sheetData[minRow]?.[minCol] ?? { value: '' };
    let newData = sheetData.map(r => [...r]);

    // Ensure grid is large enough for merge
    while (newData.length <= maxRow) {
      newData.push(Array.from({ length: newData[0]?.length || INITIAL_COLS }, () => ({ value: '' })));
    }

    if (newData[0] && newData[0].length <= maxCol) {
      const colsToAdd = maxCol - newData[0].length + 1;
      newData = newData.map(r => [
        ...r,
        ...Array.from({ length: colsToAdd }, () => ({ value: '' }))
      ]);
    }

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (r === minRow && c === minCol) {
          newData[r][c] = cellToKeep;
        } else {
          newData[r][c] = { value: '', format: cellToKeep.format }; // Inherit format from merged cell
        }
      }
    }

    setSheetData(newData);

    // Reset selection to the new merged cell
    setSelectionArea({ start: { row: minRow, col: minCol }, end: { row: maxRow, col: maxCol } });
  }, [selectionArea, merges, sheetData]);

  const handleUnmergeCells = useCallback(() => {
    const mergeToUnmerge = findMergeForCell(selectionArea.start.row, selectionArea.start.col, merges);
    if (mergeToUnmerge) {
      setMerges(prevMerges => prevMerges.filter(m => m !== mergeToUnmerge));
    }
  }, [selectionArea, merges]);


  const handleAIGenerate = async (prompt: string) => {
    setIsAILoading(true);
    setAiError(null);
    try {
      const contextData = sheetData.slice(0, 20).map(row => row.slice(0, 10));
      const result = await generateData(prompt, contextData, selectionArea);

      if (result && result.data && result.data.length > 0) {
        const newData = sheetData.map(r => [...r]);
        const { minRow, minCol } = getNormalizedSelection(selectionArea);

        // Expand grid if needed for AI-generated data
        const maxRow = minRow + result.data.length - 1;
        const maxCol = minCol + Math.max(...result.data.map(row => row.length)) - 1;

        // Add rows if necessary
        while (newData.length <= maxRow) {
          newData.push(Array.from({ length: newData[0]?.length || INITIAL_COLS }, () => ({ value: '' })));
        }

        // Add columns if necessary
        if (newData[0] && newData[0].length <= maxCol) {
          const colsToAdd = maxCol - newData[0].length + 1;
          for (let i = 0; i < newData.length; i++) {
            newData[i] = [
              ...newData[i],
              ...Array.from({ length: colsToAdd }, () => ({ value: '' }))
            ];
          }
        }

        // Insert AI-generated data
        result.data.forEach((newRow, rowIndex) => {
          newRow.forEach((cellValue, colIndex) => {
            const targetRow = minRow + rowIndex;
            const targetCol = minCol + colIndex;
            if (targetRow < newData.length && targetCol < newData[0].length) {
              const currentCell = newData[targetRow]?.[targetCol] || { value: '' };
              newData[targetRow][targetCol] = { ...currentCell, value: cellValue };
            }
          });
        });

        setSheetData(newData);

        // Show info about data source
        if (result.source === 'fallback') {
          console.info('Data generated using fallback patterns (Ollama not available)');
        } else {
          console.info('Data generated using Ollama');
        }
      } else {
        setAiError("AI generated empty or invalid data. Please try a different prompt.");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      setAiError("Failed to generate data. Please check that Ollama is running or try a different prompt.");
    } finally {
      setIsAILoading(false);
    }
  };

  const primarySelectedCell = useMemo(() => {
    const { start } = selectionArea;
    const merge = findMergeForCell(start.row, start.col, merges);
    const cellCoords = merge ? merge.start : start;
    return sheetData[cellCoords.row]?.[cellCoords.col];
  }, [selectionArea, sheetData, merges]);

  const selectionCount = useMemo(() => {
    const { minRow, maxRow, minCol, maxCol } = getNormalizedSelection(selectionArea);
    let count = 0;
    const countedMergeStarts = new Set<string>();

    // This logic accurately counts visible cells in the selection, accounting for merges.
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const merge = findMergeForCell(r, c, merges);
        if (merge) {
          const key = `${merge.start.row}-${merge.start.col}`;
          if (!countedMergeStarts.has(key)) {
            count++;
            countedMergeStarts.add(key);
          }
        } else {
          count++;
        }
      }
    }
    return count;
  }, [selectionArea, merges]);

  const selectionCountText = useMemo(() => {
    if (selectionCount > 1) {
      return `${selectionCount} selected`;
    }
    return null;
  }, [selectionCount]);

  // Auto-save to localStorage whenever sheetData or merges change
  useEffect(() => {
    try {
      localStorage.setItem('darevel-spreadsheet-data', JSON.stringify(sheetData));
      localStorage.setItem('darevel-spreadsheet-merges', JSON.stringify(merges));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [sheetData, merges]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  // Auto-save version periodically
  useEffect(() => {
    const interval = setInterval(() => {
      versionHistory.autoSave(sheetData, merges);
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [sheetData, merges]);

  // Version history handlers
  const handleSaveVersion = useCallback(() => {
    const description = prompt('Enter a description for this version (optional):');
    versionHistory.createVersion(sheetData, merges, description || undefined, false);
    alert('Version saved successfully!');
  }, [sheetData, merges]);

  const handleRestoreVersion = useCallback((version: any) => {
    setSheetData(version.data);
    setMerges(version.merges);
  }, []);

  const handleDeleteVersion = useCallback((id: string) => {
    versionHistory.deleteVersion(id);
  }, []);

  const handleClearAllVersions = useCallback(() => {
    versionHistory.clearAll();
  }, []);

  const handleImport = useCallback((data: SheetData, importedMerges: Merge[]) => {
    setSheetData(data);
    setMerges(importedMerges);
  }, []);

  return (
    <div className="flex flex-col h-screen font-sans text-gray-800">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 p-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-700">AI Spreadsheet</h1>
          <FileMenu
            sheetData={sheetData}
            merges={merges}
            onImport={handleImport}
            onSaveVersion={handleSaveVersion}
            onShowVersionHistory={() => setShowVersionHistory(true)}
          />
        </div>
        <div className="flex items-center space-x-4">
          {/* Zoom Control */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600" htmlFor="zoom-slider">
              Zoom:
            </label>
            <input
              id="zoom-slider"
              type="range"
              min="50"
              max="200"
              step="10"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-600 w-12">{zoom}%</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-gray-200 transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Sticky Toolbar */}
      <div className="sticky top-[49px] z-30 shadow-md">
        <Toolbar
          selectionArea={selectionArea}
          merges={merges}
          onMerge={handleMergeCells}
          onUnmerge={handleUnmergeCells}
          onApplyFormat={applyFormatToSelection}
          primaryCellFormat={primarySelectedCell?.format}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </div>

      {/* Formula Bar */}
      <FormulaBar
        selectionArea={selectionArea}
        value={primarySelectedCell?.value ?? ''}
        onValueChange={(value) => updateCell(selectionArea.start.row, selectionArea.start.col, value)}
        selectionCountText={selectionCountText}
      />

      {/* Main Content */}
      <main className="flex-grow flex overflow-hidden">
        <div className="flex-grow overflow-auto">
          <Spreadsheet
            sheetData={sheetData}
            selectionArea={selectionArea}
            setSelectionArea={setSelectionArea}
            updateCell={updateCell}
            merges={merges}
            zoom={zoom}
          />
        </div>
        <AIPanel
          onGenerate={handleAIGenerate}
          isLoading={isAILoading}
          error={aiError}
        />
      </main>

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        versions={versionHistory.getVersions()}
        onRestore={handleRestoreVersion}
        onDelete={handleDeleteVersion}
        onClearAll={handleClearAllVersions}
      />
    </div>
  );
};

export default App;
