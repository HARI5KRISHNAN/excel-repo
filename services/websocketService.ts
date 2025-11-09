import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import authService from './authService';

export interface UserPresence {
  username: string;
  userId: string;
  cursorRow: number;
  cursorCol: number;
  color: string;
}

export interface CellUpdate {
  sheetId: number;
  row: number;
  col: number;
  value: string;
  formula?: string;
  username: string;
  timestamp: number;
}

export interface PresenceMessage {
  action: 'joined' | 'left' | 'cursor_move';
  username: string;
  presence: UserPresence;
}

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private connected: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  connect(): Promise<void> {
    // Return existing connection promise if already connecting
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Return immediately if already connected
    if (this.connected && this.client?.connected) {
      return Promise.resolve();
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const user = authService.getCurrentUser();
      if (!user || !user.token) {
        reject(new Error('No authentication token'));
        return;
      }

      this.client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        connectHeaders: {
          Authorization: `Bearer ${user.token}`
        },
        debug: (str) => {
          console.log('[STOMP] ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.client.onConnect = () => {
        console.log('WebSocket connected');
        this.connected = true;
        this.connectionPromise = null;
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error('STOMP error', frame);
        this.connected = false;
        this.connectionPromise = null;
        reject(new Error(frame.headers['message']));
      };

      this.client.onWebSocketClose = () => {
        console.log('WebSocket closed');
        this.connected = false;
        this.connectionPromise = null;
      };

      this.client.activate();
    });

    return this.connectionPromise;
  }

  disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.connectionPromise = null;
    }
  }

  async joinSheet(sheetId: string): Promise<void> {
    await this.connect();
    if (!this.client) return;

    const user = authService.getCurrentUser();
    this.client.publish({
      destination: `/app/sheet/${sheetId}/join`,
      body: JSON.stringify({ username: user?.username })
    });
  }

  subscribeToPresence(sheetId: string, callback: (message: PresenceMessage) => void): string {
    const key = `presence-${sheetId}`;

    if (this.subscriptions.has(key)) {
      return key;
    }

    const sub = this.client!.subscribe(`/topic/sheet/${sheetId}/presence`, (message: IMessage) => {
      const data: PresenceMessage = JSON.parse(message.body);
      callback(data);
    });

    this.subscriptions.set(key, sub);
    return key;
  }

  subscribeToCursors(sheetId: string, callback: (message: PresenceMessage) => void): string {
    const key = `cursors-${sheetId}`;

    if (this.subscriptions.has(key)) {
      return key;
    }

    const sub = this.client!.subscribe(`/topic/sheet/${sheetId}/cursors`, (message: IMessage) => {
      const data: PresenceMessage = JSON.parse(message.body);
      callback(data);
    });

    this.subscriptions.set(key, sub);
    return key;
  }

  subscribeToCells(sheetId: string, callback: (message: CellUpdate) => void): string {
    const key = `cells-${sheetId}`;

    if (this.subscriptions.has(key)) {
      return key;
    }

    const sub = this.client!.subscribe(`/topic/sheet/${sheetId}/cells`, (message: IMessage) => {
      const data: CellUpdate = JSON.parse(message.body);
      callback(data);
    });

    this.subscriptions.set(key, sub);
    return key;
  }

  updateCursor(sheetId: string, row: number, col: number): void {
    if (!this.client || !this.connected) return;

    this.client.publish({
      destination: `/app/sheet/${sheetId}/cursor`,
      body: JSON.stringify({ row, col })
    });
  }

  sendCellUpdate(sheetId: number, row: number, col: number, value: string, formula?: string): void {
    if (!this.client || !this.connected) return;

    const update: Partial<CellUpdate> = {
      sheetId,
      row,
      col,
      value,
      formula
    };

    this.client.publish({
      destination: `/app/sheet/${sheetId}/cell`,
      body: JSON.stringify(update)
    });
  }

  unsubscribe(key: string): void {
    const sub = this.subscriptions.get(key);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(key);
    }
  }

  isConnected(): boolean {
    return this.connected && this.client?.connected === true;
  }
}

export default new WebSocketService();
