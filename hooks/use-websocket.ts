'use client';

import { useEffect, useRef, useState } from 'react';
import { NotificationData } from '@/types';

export function useWebSocket(userId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Connect to WebSocket server
    const ws = new WebSocket('ws://localhost:8080');
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Authenticate with user ID
      ws.send(JSON.stringify({ type: 'auth', userId }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'earning' || message.type === 'referral') {
          setNotifications(prev => [message.data, ...prev.slice(0, 49)]);
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [userId]);

  return {
    isConnected,
    notifications,
    clearNotifications: () => setNotifications([])
  };
}