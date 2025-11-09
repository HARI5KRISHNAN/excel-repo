import React, { useState, useRef, useEffect } from 'react';
import { SheetData, Merge } from '../types';
import {
  exportToExcel,
  exportToCSV,
  exportToJSON,
  importFromExcel,
  importFromCSV,
  importFromJSON
} from '../services/fileService';

interface FileMenuProps {
  sheetData: SheetData;
  merges: Merge[];
  onImport: (data: SheetData, merges: Merge[]) => void;
  onSaveVersion: () => void;
  onShowVersionHistory: () => void;
}

export const FileMenu: React.FC<FileMenuProps> = ({
  sheetData,
  merges,
  onImport,
  onSaveVersion,
  onShowVersionHistory
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importType, setImportType] = useState<'excel' | 'csv' | 'json'>('excel');

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsExportOpen(false);
        setIsImportOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format: 'excel' | 'csv' | 'json') => {
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `spreadsheet-${timestamp}`;

      switch (format) {
        case 'excel':
          exportToExcel(sheetData, merges, `${filename}.xlsx`);
          break;
        case 'csv':
          exportToCSV(sheetData, `${filename}.csv`);
          break;
        case 'json':
          exportToJSON(
            {
              data: sheetData,
              merges,
              name: filename,
              timestamp: Date.now()
            },
            `${filename}.json`
          );
          break;
      }

      setIsOpen(false);
      setIsExportOpen(false);
    } catch (error) {
      alert('Failed to export file: ' + (error as Error).message);
    }
  };

  const handleImportClick = (type: 'excel' | 'csv' | 'json') => {
    setImportType(type);
    fileInputRef.current?.click();
    setIsOpen(false);
    setIsImportOpen(false);
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let result: { data: SheetData; merges: Merge[] };

      switch (importType) {
        case 'excel':
          result = await importFromExcel(file);
          break;
        case 'csv':
          result = await importFromCSV(file);
          break;
        case 'json':
          const jsonFile = await importFromJSON(file);
          result = { data: jsonFile.data, merges: jsonFile.merges };
          break;
        default:
          throw new Error('Unknown import type');
      }

      onImport(result.data, result.merges);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert('Failed to import file: ' + (error as Error).message);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* File Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
      >
        File
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={
          importType === 'excel'
            ? '.xlsx,.xls'
            : importType === 'csv'
            ? '.csv'
            : '.json'
        }
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          {/* Save Version */}
          <button
            onClick={() => {
              onSaveVersion();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>Save Version</span>
          </button>

          {/* Version History */}
          <button
            onClick={() => {
              onShowVersionHistory();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Version History</span>
          </button>

          <div className="border-t border-gray-200 my-1"></div>

          {/* Export submenu */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              onMouseEnter={() => setIsExportOpen(true)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Export</span>
              </div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {isExportOpen && (
              <div
                className="absolute left-full top-0 ml-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg"
                onMouseLeave={() => setIsExportOpen(false)}
              >
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  CSV (.csv)
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  JSON (.json)
                </button>
              </div>
            )}
          </div>

          {/* Import submenu */}
          <div className="relative">
            <button
              onClick={() => setIsImportOpen(!isImportOpen)}
              onMouseEnter={() => setIsImportOpen(true)}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>Import</span>
              </div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {isImportOpen && (
              <div
                className="absolute left-full top-0 ml-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg"
                onMouseLeave={() => setIsImportOpen(false)}
              >
                <button
                  onClick={() => handleImportClick('excel')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleImportClick('csv')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  CSV (.csv)
                </button>
                <button
                  onClick={() => handleImportClick('json')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  JSON (.json)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
