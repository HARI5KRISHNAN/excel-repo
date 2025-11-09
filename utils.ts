
import { SelectionArea, Merge, SheetData } from './types';
import { Parser } from 'hot-formula-parser';

/**
 * Normalizes a selection area to get min/max row/col.
 */
export const getNormalizedSelection = (selection: SelectionArea) => {
  const minRow = Math.min(selection.start.row, selection.end.row);
  const maxRow = Math.max(selection.start.row, selection.end.row);
  const minCol = Math.min(selection.start.col, selection.end.col);
  const maxCol = Math.max(selection.start.col, selection.end.col);
  return { minRow, maxRow, minCol, maxCol };
};

/**
 * Finds the merge range that a given cell belongs to.
 */
export const findMergeForCell = (row: number, col: number, merges: Merge[]): Merge | undefined => {
  return merges.find(
    m => row >= m.start.row && row <= m.end.row && col >= m.start.col && col <= m.end.col
  );
};

/**
 * Checks if a cell should be highlighted as selected.
 */
export const isCellSelected = (row: number, col: number, selectionArea: SelectionArea, merges: Merge[]): boolean => {
  const { minRow, maxRow, minCol, maxCol } = getNormalizedSelection(selectionArea);

  const merge = findMergeForCell(row, col, merges);
  if (merge) {
    // A merged cell is selected if any part of it is in the selection area
    return (
      merge.start.row <= maxRow &&
      merge.end.row >= minRow &&
      merge.start.col <= maxCol &&
      merge.end.col >= minCol
    );
  }

  // A normal cell is selected if it's within the selection rectangle
  return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
};

/**
 * Evaluates Excel-style formula string.
 */
export const evaluateFormula = (
  formula: string,
  sheetData: SheetData
): string => {
  // Create a fresh parser instance to avoid duplicate event listeners
  const parser = new Parser();

  // Helper to get cell value from sheet data
  const getCellValue = (row: number, col: number): any => {
    const cellData = sheetData[row]?.[col];
    if (!cellData) return '';

    const value = cellData.value;
    // Convert numeric strings to numbers for proper calculation
    const numValue = parseFloat(value);
    return isNaN(numValue) ? value : numValue;
  };

  // Handle cell references (e.g., A1, B2)
  parser.on('callCellValue', (cellCoord: any, done: (value: any) => void) => {
    try {
      const r = cellCoord.row.index;
      const c = cellCoord.column.index;
      const val = getCellValue(r, c);
      done(val);
    } catch (err) {
      done(null);
    }
  });

  // Handle range references (e.g., A1:A5)
  parser.on('callRangeValue', (startCellCoord: any, endCellCoord: any, done: (value: any) => void) => {
    const results = [];
    const startRow = startCellCoord.row.index;
    const endRow = endCellCoord.row.index;
    const startCol = startCellCoord.column.index;
    const endCol = endCellCoord.column.index;

    for (let r = startRow; r <= endRow; r++) {
      const rowVals = [];
      for (let c = startCol; c <= endCol; c++) {
        rowVals.push(getCellValue(r, c));
      }
      results.push(rowVals);
    }
    done(results);
  });

  // Parse the formula (remove '=' if present)
  const formulaToParse = formula.startsWith('=') ? formula.slice(1) : formula;
  const result = parser.parse(formulaToParse);

  // Return error or result
  if (result.error) {
    return '#ERROR!';
  }

  return String(result.result);
};
