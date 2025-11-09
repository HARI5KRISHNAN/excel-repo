import React, { useState, useEffect } from 'react';
import apiService, { SheetResponse } from '../services/apiService';
import { SheetData, Merge } from '../types';

interface LoadSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (id: number, name: string, data: SheetData, merges: Merge[]) => void;
}

export const LoadSheetModal: React.FC<LoadSheetModalProps> = ({ isOpen, onClose, onLoad }) => {
  const [sheets, setSheets] = useState<SheetResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSheets();
    }
  }, [isOpen]);

  const loadSheets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loadedSheets = await apiService.loadAllSheets();
      setSheets(loadedSheets);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sheets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSheet = (sheet: SheetResponse) => {
    try {
      const data = apiService.parseSheetData(sheet.data);
      const merges = apiService.parseMerges(sheet.merges);
      onLoad(sheet.id, sheet.name, data, merges);
      onClose();
    } catch (err) {
      setError('Failed to parse sheet data');
    }
  };

  const handleDeleteSheet = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this sheet?')) return;

    try {
      await apiService.deleteSheet(id);
      setSheets(sheets.filter(s => s.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete sheet');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Load Sheet from Cloud</h2>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading sheets...</p>
            </div>
          ) : sheets.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No sheets found. Create a new one to get started!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sheets.map((sheet) => (
                <div
                  key={sheet.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                  onClick={() => handleLoadSheet(sheet)}
                >
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-800 dark:text-white">{sheet.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Last saved: {new Date(sheet.lastSavedAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Created: {new Date(sheet.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSheet(sheet.id, e)}
                    className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
