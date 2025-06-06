// import { store } from '@/store/store';
// import { setCurrentPlayer, updatePlayerHand } from '@/store/features/gameSlice';
import { Message } from '@/model/message';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 3000;
  private onConnectCallback: (() => void) | null = null;

  connect(gameId: string, onConnect?: () => void) {
    const wsUrl = `ws://140.245.228.15:8080/ws?gameId=${gameId}`;
    this.onConnectCallback = onConnect || null;

    const token = localStorage.getItem('token');
    try {
      // Use subprotocols for authentication
      // The server must support these protocols in its handshake
      this.socket = new WebSocket(wsUrl, [token || '']);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        if (this.onConnectCallback) {
          this.onConnectCallback();
        }
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

  private handleMessage(message: Message) {
    switch (message.type) {
      case 'PLAYER_TURN':
        // store.dispatch(setCurrentPlayer(message.playerId));
        break;
      case 'UPDATE_HAND':
        // store.dispatch(updatePlayerHand({
        //   playerId: message.playerId,
        //   cards: message.cards
        // }));
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  sendMessage(message: Message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }
}

export const websocketService = new WebSocketService(); 