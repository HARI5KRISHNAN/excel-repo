import React, { useState, useEffect } from 'react';
import collaborationService, { PermissionData } from '../services/collaborationService';

interface ShareSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetId: number;
  sheetName: string;
}

export const ShareSheetModal: React.FC<ShareSheetModalProps> = ({
  isOpen,
  onClose,
  sheetId,
  sheetName,
}) => {
  const [permissions, setPermissions] = useState<PermissionData[]>([]);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'OWNER' | 'EDITOR' | 'VIEWER'>('EDITOR');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPermissions();
    }
  }, [isOpen, sheetId]);

  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      const data = await collaborationService.getPermissions(sheetId);
      setPermissions(data);
    } catch (err: any) {
      setError('Failed to load permissions');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!username.trim()) return;

    try {
      setError(null);
      setSuccess(null);
      await collaborationService.grantPermission(sheetId, username.trim(), role);
      setSuccess(`Successfully shared with ${username}`);
      setUsername('');
      await loadPermissions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to share sheet');
    }
  };

  const handleRevoke = async (permissionId: number, permUsername: string) => {
    if (!confirm(`Remove access for ${permUsername}?`)) return;

    try {
      await collaborationService.revokePermission(sheetId, permissionId);
      await loadPermissions();
    } catch (err: any) {
      setError('Failed to revoke permission');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Share "{sheetName}"
          </h2>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Share Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Add people
            </h3>

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded">
                {success}
              </div>
            )}

            <div className="flex space-x-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="VIEWER">Viewer</option>
                <option value="EDITOR">Editor</option>
                <option value="OWNER">Owner</option>
              </select>
              <button
                onClick={handleShare}
                disabled={!username.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Share
              </button>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="space-y-1">
                <div><strong>Owner:</strong> Can edit, manage permissions, and delete the sheet</div>
                <div><strong>Editor:</strong> Can edit and add comments</div>
                <div><strong>Viewer:</strong> Can view and add comments (read-only)</div>
              </div>
            </div>
          </div>

          {/* Current Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              People with access
            </h3>

            {isLoading ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            ) : permissions.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No collaborators yet
              </div>
            ) : (
              <div className="space-y-2">
                {permissions.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {perm.username}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {perm.email}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-sm rounded ${
                        perm.role === 'OWNER'
                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                          : perm.role === 'EDITOR'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {perm.role}
                      </span>
                      <button
                        onClick={() => handleRevoke(perm.id, perm.username)}
                        className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
