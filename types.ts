export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export interface CellData {
  value: string;
  formula?: string; // Store the original formula if the cell contains one
  format?: Partial<CellFormat>;
}

export type RowData = CellData[];
export type SheetData = RowData[];

export interface CellCoords {
  row: number;
  col: number;
}

export interface SelectionArea {
  start: CellCoords;
  end: CellCoords;
}

export interface Merge {
  start: CellCoords;
  end: CellCoords;
}
