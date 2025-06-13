import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '@shared/types';

// Define client and server events separately
type ClientEvents = {
  'join-game': (gameType: string) => void;
  'leave-game': (gameType: string) => void;
  'place-bet': (bet: any) => void;
  'get-leaderboard': (data: { timeframe: string; limit: number }) => void;
};

type ServerEvents = {
  'bet-placed': (bet: any) => void;
  'bet-result': (bet: any) => void;
  'game-update': (data: any) => void;
  'balance-update': (balance: number) => void;
  'error': (error: string) => void;
  'leaderboard-update': (data: any[]) => void;
};

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: (token: string) => {
    const { socket: existingSocket } = get();
    
    // Disconnect existing socket if any
    if (existingSocket) {
      existingSocket.disconnect();
    }

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ isConnected: false });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      set({ isConnected: false });
    });

    set({ socket, isConnected: socket.connected });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  emit: (event, data) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  },

  on: (event, callback) => {
    const { socket } = get();
    if (socket) {
      socket.on(event, callback);
    }
  },

  off: (event, callback) => {
    const { socket } = get();
    if (socket) {
      if (callback) {
        socket.off(event, callback);
      } else {
        socket.off(event);
      }
    }
  },
}));