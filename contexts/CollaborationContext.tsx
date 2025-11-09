import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import websocketService, { UserPresence, CellUpdate } from '../services/websocketService';
import { useAuth } from './AuthContext';

interface CollaborationContextType {
  activeUsers: Map<string, UserPresence>;
  isConnected: boolean;
  joinSheet: (sheetId: number) => Promise<void>;
  leaveSheet: () => void;
  updateCursor: (row: number, col: number) => void;
  sendCellUpdate: (row: number, col: number, value: string, formula?: string) => void;
  onCellUpdate: ((update: CellUpdate) => void) | null;
  setOnCellUpdate: (callback: (update: CellUpdate) => void) => void;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeUsers, setActiveUsers] = useState<Map<string, UserPresence>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [currentSheetId, setCurrentSheetId] = useState<string | null>(null);
  const [onCellUpdate, setOnCellUpdate] = useState<((update: CellUpdate) => void) | null>(null);
  const { user } = useAuth();

  const joinSheet = useCallback(async (sheetId: number) => {
    if (!user) return;

    try {
      await websocketService.connect();
      setIsConnected(true);

      const sheetIdStr = sheetId.toString();
      setCurrentSheetId(sheetIdStr);

      // Subscribe to presence updates
      websocketService.subscribeToPresence(sheetIdStr, (message) => {
        setActiveUsers((prev) => {
          const newUsers = new Map(prev);

          if (message.action === 'joined') {
            newUsers.set(message.username, message.presence);
          } else if (message.action === 'left') {
            newUsers.delete(message.username);
          }

          return newUsers;
        });
      });

      // Subscribe to cursor movements
      websocketService.subscribeToCursors(sheetIdStr, (message) => {
        if (message.action === 'cursor_move') {
          setActiveUsers((prev) => {
            const newUsers = new Map(prev);
            const existing = newUsers.get(message.username);
            if (existing) {
              newUsers.set(message.username, message.presence);
            }
            return newUsers;
          });
        }
      });

      // Subscribe to cell updates
      websocketService.subscribeToCells(sheetIdStr, (update) => {
        // Don't process our own updates
        if (update.username !== user.username && onCellUpdate) {
          onCellUpdate(update);
        }
      });

      // Join the sheet
      await websocketService.joinSheet(sheetIdStr);
    } catch (error) {
      console.error('Failed to join sheet:', error);
      setIsConnected(false);
    }
  }, [user, onCellUpdate]);

  const leaveSheet = useCallback(() => {
    websocketService.disconnect();
    setIsConnected(false);
    setCurrentSheetId(null);
    setActiveUsers(new Map());
  }, []);

  const updateCursor = useCallback((row: number, col: number) => {
    if (currentSheetId && isConnected) {
      websocketService.updateCursor(currentSheetId, row, col);
    }
  }, [currentSheetId, isConnected]);

  const sendCellUpdate = useCallback((row: number, col: number, value: string, formula?: string) => {
    if (currentSheetId && isConnected) {
      websocketService.sendCellUpdate(parseInt(currentSheetId), row, col, value, formula);
    }
  }, [currentSheetId, isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveSheet();
    };
  }, [leaveSheet]);

  return (
    <CollaborationContext.Provider
      value={{
        activeUsers,
        isConnected,
        joinSheet,
        leaveSheet,
        updateCursor,
        sendCellUpdate,
        onCellUpdate,
        setOnCellUpdate,
      }}
    >
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};
