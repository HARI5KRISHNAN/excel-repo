import React from 'react';
import { useCollaboration } from '../contexts/CollaborationContext';
import { useAuth } from '../contexts/AuthContext';

export const UserPresenceBar: React.FC = () => {
  const { activeUsers, isConnected } = useCollaboration();
  const { user } = useAuth();

  // Filter out current user
  const otherUsers = Array.from(activeUsers.values()).filter(
    (u) => u.username !== user?.username
  );

  if (!isConnected || otherUsers.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-900 border-l border-gray-300 dark:border-gray-600">
      <div className="flex items-center space-x-1">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" />
        </svg>
        <span className="text-xs text-gray-700 dark:text-gray-300">
          {otherUsers.length} {otherUsers.length === 1 ? 'user' : 'users'} online
        </span>
      </div>
      <div className="flex -space-x-2">
        {otherUsers.slice(0, 5).map((u, idx) => (
          <div
            key={u.username}
            className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-semibold text-white"
            style={{ backgroundColor: u.color, zIndex: 5 - idx }}
            title={u.username}
          >
            {u.username.charAt(0).toUpperCase()}
          </div>
        ))}
        {otherUsers.length > 5 && (
          <div
            className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-semibold bg-gray-400 text-white"
            title={`+${otherUsers.length - 5} more`}
          >
            +{otherUsers.length - 5}
          </div>
        )}
      </div>
    </div>
  );
};
