import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface JoinRecipePayload {
  recipeId: number;
  userId: number;
  username: string;
}

export interface RecipeChangePayload extends JoinRecipePayload {
  field: string;
  value: string | number | null;
  clientEventId: string;
}

export interface CursorPayload extends JoinRecipePayload {
  field: string;
  position: number;
}

export interface PresencePayload extends JoinRecipePayload {
  status: 'joined' | 'left';
}

interface ServerToClientEvents {
  recipeChange: (payload: RecipeChangePayload) => void;
  cursorMove: (payload: CursorPayload) => void;
  presence: (payload: PresencePayload) => void;
}

interface ClientToServerEvents {
  joinRecipe: (payload: JoinRecipePayload) => void;
  leaveRecipe: (payload: JoinRecipePayload) => void;
  recipeChange: (payload: RecipeChangePayload) => void;
  cursorMove: (payload: CursorPayload) => void;
}

type RecipeSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useWebSocket(recipeId: number | null, userId: number | null, username: string | null) {
  const socketRef = useRef<RecipeSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [presenceEvents, setPresenceEvents] = useState<PresencePayload[]>([]);
  const [changes, setChanges] = useState<RecipeChangePayload[]>([]);
  const [cursorEvents, setCursorEvents] = useState<CursorPayload[]>([]);

  const connect = useCallback(() => {
    if (!recipeId || !userId || !username || socketRef.current) {
      return;
    }
    const url = import.meta.env.VITE_WS_URL ?? window.location.origin;
    const socket: RecipeSocket = io(url, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 8,
    });
    socket.on('connect', () => {
      setConnected(true);
      socket.emit('joinRecipe', { recipeId, userId, username });
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('presence', (payload) => {
      setPresenceEvents((events) => [payload, ...events].slice(0, 12));
    });
    socket.on('recipeChange', (payload) => {
      setChanges((events) => [payload, ...events].slice(0, 20));
    });
    socket.on('cursorMove', (payload) => {
      setCursorEvents((events) => [payload, ...events].slice(0, 20));
    });
    socketRef.current = socket;
  }, [recipeId, userId, username]);

  const disconnect = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !recipeId || !userId || !username) {
      return;
    }
    socket.emit('leaveRecipe', { recipeId, userId, username });
    socket.disconnect();
    socketRef.current = null;
    setConnected(false);
  }, [recipeId, userId, username]);

  const send = useCallback((payload: RecipeChangePayload) => {
    socketRef.current?.emit('recipeChange', payload);
  }, []);

  const sendCursor = useCallback((payload: CursorPayload) => {
    socketRef.current?.emit('cursorMove', payload);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    connected,
    presenceEvents,
    changes,
    cursorEvents,
    connect,
    disconnect,
    send,
    sendCursor,
  };
}
