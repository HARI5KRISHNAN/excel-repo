import React, { useState } from 'react';
import { Version } from '../services/versionHistory';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions: Version[];
  onRestore: (version: Version) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  versions,
  onRestore,
  onDelete,
  onClearAll
}) => {
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleRestore = (version: Version) => {
    if (confirm(`Restore version from ${formatDate(version.timestamp)}? Your current data will be replaced.`)) {
      onRestore(version);
      onClose();
    }
  };

  const handleClearAll = () => {
    if (confirm('Delete all version history? This cannot be undone.')) {
      onClearAll();
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Version History</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-4">
          {versions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium">No versions saved yet</p>
              <p className="text-sm mt-2">Use "Save Version" to create a restore point</p>
            </div>
          ) : (
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`border rounded-lg p-3 transition-colors ${
                    selectedVersion?.id === version.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion(version)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          version.auto
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-blue-200 text-blue-700'
                        }`}>
                          {version.auto ? 'Auto-save' : 'Manual'}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatDate(version.timestamp)}
                        </span>
                      </div>
                      {version.description && (
                        <p className="text-sm text-gray-700 mt-1">{version.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{version.data.length} rows</span>
                        <span>•</span>
                        <span>{version.data[0]?.length || 0} columns</span>
                        {version.merges.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{version.merges.length} merges</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(version);
                        }}
                        className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                        title="Restore this version"
                      >
                        Restore
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this version?')) {
                            onDelete(version.id);
                          }
                        }}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete version"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {versions.length} version{versions.length !== 1 ? 's' : ''} saved
          </div>
          <div className="flex items-center space-x-2">
            {versions.length > 0 && (
              <>
                {showDeleteConfirm ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Are you sure?</span>
                    <button
                      onClick={handleClearAll}
                      className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                    >
                      Yes, clear all
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
