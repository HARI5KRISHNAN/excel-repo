import React, { useState, useEffect } from 'react';
import collaborationService, { ChangeLogEntry } from '../services/collaborationService';

interface ChangeLogViewerProps {
  isOpen: boolean;
  onClose: () => void;
  sheetId: number;
}

export const ChangeLogViewer: React.FC<ChangeLogViewerProps> = ({
  isOpen,
  onClose,
  sheetId,
}) => {
  const [logs, setLogs] = useState<ChangeLogEntry[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, sheetId, page]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const data = await collaborationService.getChangeLog(sheetId, page, 50);
      setLogs(data.logs);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError('Failed to load change log');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCellLabel = (row?: number, col?: number) => {
    if (row === undefined || col === undefined) return '';
    const colLabel = String.fromCharCode(65 + col);
    return `${colLabel}${row + 1}`;
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CELL_EDIT':
        return 'Edited cell';
      case 'CELL_FORMAT':
        return 'Formatted cell';
      case 'MERGE':
        return 'Merged cells';
      case 'UNMERGE':
        return 'Unmerged cells';
      default:
        return action;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Change History
          </h2>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading change history...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No changes recorded yet
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {log.username}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {getActionLabel(log.action)}
                        </span>
                        {log.row !== undefined && log.col !== undefined && (
                          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                            {getCellLabel(log.row, log.col)}
                          </span>
                        )}
                      </div>

                      {log.oldValue !== undefined && log.newValue !== undefined && (
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="line-through text-red-600 dark:text-red-400">
                            {log.oldValue || '(empty)'}
                          </span>
                          {' → '}
                          <span className="text-green-600 dark:text-green-400">
                            {log.newValue || '(empty)'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
