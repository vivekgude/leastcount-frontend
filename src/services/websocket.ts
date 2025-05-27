import { store } from '@/store/store';
import { setCurrentPlayer, updatePlayerHand, updatePlayerScore } from '@/store/features/gameSlice';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 3000;

  connect(gameId: string) {
    const wsUrl = `ws://140.245.228.15:8080/ws?gameId=${gameId}`;

    const token = localStorage.getItem('token');
    try {
      // Use subprotocols for authentication
      // The server must support these protocols in its handshake
      this.socket = new WebSocket(wsUrl, [token || '']);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        const gameId = '1001'; // Hardcoded for now
        this.connect(gameId);
      }, this.reconnectTimeout);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'PLAYER_TURN':
        store.dispatch(setCurrentPlayer(data.playerId));
        break;
      case 'UPDATE_HAND':
        store.dispatch(updatePlayerHand({
          playerId: data.playerId,
          cards: data.cards
        }));
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  sendMessage(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }
}

export const websocketService = new WebSocketService(); 