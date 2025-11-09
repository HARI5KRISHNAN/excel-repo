import React, { useMemo, useRef } from 'react';
import { SelectionArea, Merge, CellFormat } from '../types';
import {
    MergeIcon, UnmergeIcon, BoldIcon, ItalicIcon, UnderlineIcon, TextColorIcon,
    BgColorIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, AlignTopIcon,
    AlignMiddleIcon, AlignBottomIcon, UndoIcon, RedoIcon
} from './Icons';
import { getNormalizedSelection, findMergeForCell } from '../utils';

interface ToolbarProps {
  selectionArea: SelectionArea;
  merges: Merge[];
  onMerge: () => void;
  onUnmerge: () => void;
  onApplyFormat: (format: Partial<CellFormat>) => void;
  primaryCellFormat?: Partial<CellFormat>;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const ToolbarButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }> = ({ active, ...props }) => (
  <button
    {...props}
    className={`p-1.5 rounded-md ${active ? 'bg-gray-300' : 'hover:bg-gray-200'} disabled:text-gray-300 disabled:hover:bg-transparent`}
  />
);

const ColorPicker: React.FC<{
  icon: React.ReactNode;
  title: string;
  value?: string;
  onChange: (color: string) => void;
}> = ({ icon, title, value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const effectiveValue = value || '#000000';
  
  return (
    <div className="relative p-1.5 rounded-md hover:bg-gray-200" title={title}>
      {icon}
      <input
        ref={inputRef}
        type="color"
        value={effectiveValue}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
};

const SelectControl: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className="text-xs p-1 h-8 border border-gray-300 rounded-md bg-white hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500" />
);


const defaultCellFormat: Partial<CellFormat> = {
    bold: false,
    italic: false,
    underline: false,
    fontFamily: 'Calibri',
    fontSize: 12,
    textAlign: 'left',
    verticalAlign: 'middle',
    textColor: '#000000',
};

const FONT_FAMILIES = ['Calibri', 'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia', 'Impact'];
const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48];

export const Toolbar: React.FC<ToolbarProps> = ({
    selectionArea,
    merges,
    onMerge,
    onUnmerge,
    onApplyFormat,
    primaryCellFormat = defaultCellFormat,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false
}) => {
  const isMergeable = useMemo(() => {
    const { minRow, maxRow, minCol, maxCol } = getNormalizedSelection(selectionArea);
    return minRow !== maxRow || minCol !== maxCol;
  }, [selectionArea]);

  const isUnmergeable = useMemo(() => {
    return !!findMergeForCell(selectionArea.start.row, selectionArea.start.col, merges);
  }, [selectionArea, merges]);

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-3 py-1 flex items-center space-x-2 text-sm text-gray-700 flex-wrap">
      {/* Undo/Redo buttons */}
      {(onUndo || onRedo) && (
        <>
          <div className="flex items-center space-x-1">
            <ToolbarButton onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
              <UndoIcon className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
              <RedoIcon className="w-5 h-5" />
            </ToolbarButton>
          </div>
          <div className="h-5 border-l border-gray-300 mx-1"></div>
        </>
      )}

      <div className="flex items-center space-x-1">
        <ToolbarButton onClick={onMerge} disabled={!isMergeable} title="Merge cells">
          <MergeIcon className="w-5 h-5" />
        </ToolbarButton>
        <ToolbarButton onClick={onUnmerge} disabled={!isUnmergeable} title="Unmerge cells">
          <UnmergeIcon className="w-5 h-5" />
        </ToolbarButton>
      </div>

      <div className="h-5 border-l border-gray-300 mx-1"></div>

      <div className="flex items-center space-x-1">
        <SelectControl
            value={primaryCellFormat.fontFamily || 'Calibri'}
            onChange={(e) => onApplyFormat({ fontFamily: e.target.value })}
            title="Font"
        >
            {FONT_FAMILIES.map(font => <option key={font} value={font}>{font}</option>)}
        </SelectControl>
        <SelectControl
            value={primaryCellFormat.fontSize || 12}
            onChange={(e) => onApplyFormat({ fontSize: parseInt(e.target.value, 10) })}
            title="Font size"
        >
            {FONT_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
        </SelectControl>
      </div>

      <div className="h-5 border-l border-gray-300 mx-1"></div>

      <div className="flex items-center space-x-1">
        <ToolbarButton onClick={() => onApplyFormat({ bold: !primaryCellFormat.bold })} active={primaryCellFormat.bold} title="Bold (Ctrl+B)">
          <BoldIcon className="w-5 h-5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => onApplyFormat({ italic: !primaryCellFormat.italic })} active={primaryCellFormat.italic} title="Italic (Ctrl+I)">
          <ItalicIcon className="w-5 h-5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => onApplyFormat({ underline: !primaryCellFormat.underline })} active={primaryCellFormat.underline} title="Underline (Ctrl+U)">
          <UnderlineIcon className="w-5 h-5" />
        </ToolbarButton>
        
        <ColorPicker 
          icon={<TextColorIcon className="w-5 h-5" style={{ color: primaryCellFormat.textColor }} />}
          title="Text color"
          value={primaryCellFormat.textColor}
          onChange={(color) => onApplyFormat({ textColor: color })}
        />
        
        <ColorPicker
          icon={<BgColorIcon className="w-5 h-5" style={{ color: primaryCellFormat.backgroundColor }}/>}
          title="Fill color"
          value={primaryCellFormat.backgroundColor}
          onChange={(color) => onApplyFormat({ backgroundColor: color })}
        />
      </div>
      
      <div className="h-5 border-l border-gray-300 mx-1"></div>

      <div className="flex items-center space-x-1">
          <ToolbarButton onClick={() => onApplyFormat({ verticalAlign: 'top' })} active={primaryCellFormat.verticalAlign === 'top'} title="Top align">
            <AlignTopIcon className="w-5 h-5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => onApplyFormat({ verticalAlign: 'middle' })} active={primaryCellFormat.verticalAlign === 'middle' || !primaryCellFormat.verticalAlign} title="Middle align">
            <AlignMiddleIcon className="w-5 h-5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => onApplyFormat({ verticalAlign: 'bottom' })} active={primaryCellFormat.verticalAlign === 'bottom'} title="Bottom align">
            <AlignBottomIcon className="w-5 h-5" />
          </ToolbarButton>
      </div>

      <div className="h-5 border-l border-gray-300 mx-1"></div>
      
      <div className="flex items-center space-x-1">
          <ToolbarButton onClick={() => onApplyFormat({ textAlign: 'left' })} active={primaryCellFormat.textAlign === 'left' || !primaryCellFormat.textAlign} title="Align left">
            <AlignLeftIcon className="w-5 h-5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => onApplyFormat({ textAlign: 'center' })} active={primaryCellFormat.textAlign === 'center'} title="Center">
            <AlignCenterIcon className="w-5 h-5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => onApplyFormat({ textAlign: 'right' })} active={primaryCellFormat.textAlign === 'right'} title="Align right">
            <AlignRightIcon className="w-5 h-5" />
          </ToolbarButton>
      </div>
    </div>
  );
};
