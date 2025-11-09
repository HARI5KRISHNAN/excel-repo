import * as XLSX from 'xlsx';
import { SheetData, Merge, CellFormat } from '../types';

export interface SpreadsheetFile {
  data: SheetData;
  merges: Merge[];
  name: string;
  timestamp: number;
  version?: number;
}

/**
 * Export spreadsheet to Excel (.xlsx) format
 */
export function exportToExcel(data: SheetData, merges: Merge[], filename: string = 'spreadsheet.xlsx'): void {
  try {
    // Convert our data format to SheetJS format
    const worksheetData: any[][] = data.map(row =>
      row.map(cell => cell.value || '')
    );

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Apply merges
    if (merges.length > 0) {
      worksheet['!merges'] = merges.map(merge => ({
        s: { r: merge.start.row, c: merge.start.col },
        e: { r: merge.end.row, c: merge.end.col }
      }));
    }

    // Apply cell styles/formats
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = data[R]?.[C];
        if (!cell) continue;

        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const wsCell = worksheet[cellAddress];

        if (wsCell && cell.format) {
          wsCell.s = {};

          // Font styles
          if (cell.format.bold || cell.format.italic) {
            wsCell.s.font = {
              bold: cell.format.bold,
              italic: cell.format.italic,
              underline: cell.format.underline
            };
          }

          // Alignment
          if (cell.format.textAlign || cell.format.verticalAlign) {
            wsCell.s.alignment = {
              horizontal: cell.format.textAlign,
              vertical: cell.format.verticalAlign
            };
          }

          // Colors
          if (cell.format.backgroundColor || cell.format.textColor) {
            wsCell.s.fill = cell.format.backgroundColor ? {
              fgColor: { rgb: cell.format.backgroundColor.replace('#', '') }
            } : undefined;
            wsCell.s.font = wsCell.s.font || {};
            if (cell.format.textColor) {
              wsCell.s.font.color = { rgb: cell.format.textColor.replace('#', '') };
            }
          }
        }
      }
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Save file
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
}

/**
 * Export spreadsheet to CSV format
 */
export function exportToCSV(data: SheetData, filename: string = 'spreadsheet.csv'): void {
  try {
    // Convert data to CSV string
    const csvContent = data.map(row =>
      row.map(cell => {
        let value = cell.value || '';
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      }).join(',')
    ).join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export to CSV');
  }
}

/**
 * Import Excel file
 */
export async function importFromExcel(file: File): Promise<{ data: SheetData; merges: Merge[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { type: 'array', cellStyles: true });

        // Get first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];

        // Convert to array of arrays
        const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        // Convert to our SheetData format with cell objects
        const data: SheetData = rawData.map(row =>
          (Array.isArray(row) ? row : []).map(value => ({
            value: String(value || '')
          }))
        );

        // Extract merges
        const merges: Merge[] = (worksheet['!merges'] || []).map((merge: any) => ({
          start: { row: merge.s.r, col: merge.s.c },
          end: { row: merge.e.r, col: merge.e.c }
        }));

        // Try to extract formatting
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        for (let R = range.s.r; R <= range.e.r; ++R) {
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const wsCell = worksheet[cellAddress];

            if (wsCell && wsCell.s && data[R]?.[C]) {
              const format: Partial<CellFormat> = {};

              // Font styles
              if (wsCell.s.font) {
                if (wsCell.s.font.bold) format.bold = true;
                if (wsCell.s.font.italic) format.italic = true;
                if (wsCell.s.font.underline) format.underline = true;
                if (wsCell.s.font.color?.rgb) {
                  format.textColor = '#' + wsCell.s.font.color.rgb;
                }
              }

              // Alignment
              if (wsCell.s.alignment) {
                if (wsCell.s.alignment.horizontal) {
                  format.textAlign = wsCell.s.alignment.horizontal as any;
                }
                if (wsCell.s.alignment.vertical) {
                  format.verticalAlign = wsCell.s.alignment.vertical as any;
                }
              }

              // Background color
              if (wsCell.s.fill?.fgColor?.rgb) {
                format.backgroundColor = '#' + wsCell.s.fill.fgColor.rgb;
              }

              if (Object.keys(format).length > 0) {
                data[R][C].format = format;
              }
            }
          }
        }

        resolve({ data, merges });
      } catch (error) {
        console.error('Error importing Excel file:', error);
        reject(new Error('Failed to import Excel file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Import CSV file
 */
export async function importFromCSV(file: File): Promise<{ data: SheetData; merges: Merge[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;

        // Parse CSV
        const rows = parseCSV(text);

        // Convert to our SheetData format
        const data: SheetData = rows.map(row =>
          row.map(value => ({ value }))
        );

        resolve({ data, merges: [] });
      } catch (error) {
        console.error('Error importing CSV file:', error);
        reject(new Error('Failed to import CSV file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Simple CSV parser that handles quoted values
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;

    const row: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        row.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    row.push(current);
    rows.push(row);
  }

  return rows;
}

/**
 * Save spreadsheet to JSON file
 */
export function exportToJSON(file: SpreadsheetFile, filename: string = 'spreadsheet.json'): void {
  try {
    const json = JSON.stringify(file, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw new Error('Failed to export to JSON');
  }
}

/**
 * Import JSON file
 */
export async function importFromJSON(file: File): Promise<SpreadsheetFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        // Validate structure
        if (!parsed.data || !Array.isArray(parsed.data)) {
          throw new Error('Invalid file format');
        }

        resolve(parsed as SpreadsheetFile);
      } catch (error) {
        console.error('Error importing JSON file:', error);
        reject(new Error('Failed to import JSON file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
