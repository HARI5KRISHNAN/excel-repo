import React from 'react';
import { useCollaboration } from '../contexts/CollaborationContext';
import { useAuth } from '../contexts/AuthContext';

interface LiveCursorsProps {
  cellWidth: number;
  cellHeight: number;
}

export const LiveCursors: React.FC<LiveCursorsProps> = ({ cellWidth, cellHeight }) => {
  const { activeUsers } = useCollaboration();
  const { user } = useAuth();

  // Filter out current user
  const otherUsers = Array.from(activeUsers.entries()).filter(
    ([username]) => username !== user?.username
  );

  if (otherUsers.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 100 }}>
      {otherUsers.map(([username, presence]) => {
        const left = presence.cursorCol * cellWidth;
        const top = presence.cursorRow * cellHeight;

        return (
          <div
            key={username}
            className="absolute transition-all duration-200 ease-out"
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: `${cellWidth}px`,
              height: `${cellHeight}px`,
              border: `2px solid ${presence.color}`,
              backgroundColor: `${presence.color}20`,
            }}
          >
            <div
              className="absolute -top-6 left-0 px-2 py-1 rounded text-xs text-white whitespace-nowrap shadow-lg"
              style={{
                backgroundColor: presence.color,
              }}
            >
              {username}
            </div>
          </div>
        );
      })}
    </div>
  );
};
