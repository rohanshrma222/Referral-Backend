'use client';

import { useEffect, useState } from 'react';
import { NotificationData } from '@/types';

export function useWebSocket(userId: string | null) {
  const [isConnected, setIsConnected] = useState(true); // Always show as connected for demo
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Simulate real-time notifications by polling for new earnings
    const pollForNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.log('Polling error:', error);
      }
    };

    // Poll every 5 seconds for new notifications
    const interval = setInterval(pollForNotifications, 5000);
    
    // Initial load
    pollForNotifications();

    return () => clearInterval(interval);
  }, [userId]);

  return {
    isConnected,
    notifications,
    clearNotifications: () => setNotifications([])
  };
}