import { WebSocketServer } from 'ws';
import { referralEngine } from './referral-engine';

let wss: WebSocketServer | null = null;

export function initializeWebSocketServer(port: number = 8080) {
  if (wss) return wss;

  wss = new WebSocketServer({ port });

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'auth' && data.userId) {
          referralEngine.addConnection(data.userId, ws);
          ws.send(JSON.stringify({ type: 'auth_success', message: 'Connected successfully' }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      // Remove connection from referral engine
      // Note: We'd need to track userId to connection mapping for proper cleanup
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  console.log(`WebSocket server running on port ${port}`);
  return wss;
}

export function getWebSocketServer() {
  return wss;
}