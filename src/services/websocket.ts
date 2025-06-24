// import { store } from '@/store/store';
// import { setCurrentPlayer, updatePlayerHand } from '@/store/features/gameSlice';
import { Message } from '@/model/message';
import { GameDetails, WebSocketMessage, GameStartResponse, CardsResponse } from '@/types';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 3000;
  private onConnectCallback: (() => void) | null = null;
  private gameDetailsHandler: ((details: GameDetails) => void) | null = null;
  private gameStartHandler: ((response: GameStartResponse) => void) | null = null;
  private cardsHandler: ((response: CardsResponse) => void) | null = null;
  private isIntentionalDisconnect = false;

  connect(gameId: string, onConnect?: () => void) {
    const wsUrl = `wss://leastcount.duckdns.org/ws?gameId=${gameId}`;
    console.log('Attempting to connect to:', wsUrl);
    this.onConnectCallback = onConnect || null;
    this.isIntentionalDisconnect = false;

    const token = localStorage.getItem('token');
    console.log('Token:', token);
    try {
      // Use subprotocols for authentication
      // The server must support these protocols in its handshake
      this.socket = new WebSocket(wsUrl, [token || '']);

      this.socket.onopen = () => {
        console.log('WebSocket connected successfully');
        this.reconnectAttempts = 0;
        if (this.onConnectCallback) {
          this.onConnectCallback();
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          url: wsUrl
        });
        
        // Only attempt reconnection if it wasn't an intentional disconnect
        if (!this.isIntentionalDisconnect) {
          this.handleReconnect(gameId);
        } else {
          console.log('Intentional disconnect - not attempting reconnection');
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.error('WebSocket readyState:', this.socket?.readyState);
        console.error('WebSocket URL:', wsUrl);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }

  private handleReconnect(gameId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        this.connect(gameId);
      }, this.reconnectTimeout);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    this.isIntentionalDisconnect = true;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    // Reset reconnection attempts
    this.reconnectAttempts = 0;
  }

  setGameDetailsHandler(handler: (details: GameDetails) => void) {
    this.gameDetailsHandler = handler;
  }

  setGameStartHandler(handler: (response: GameStartResponse) => void) {
    this.gameStartHandler = handler;
  }

  setCardsHandler(handler: (response: CardsResponse) => void) {
    this.cardsHandler = handler;
  }

  private handleMessage(message: WebSocketMessage) {
    // Handle game details response
    if (message.gameState !== undefined && message.players) {
      console.log('Received game details:', message);
      if (this.gameDetailsHandler) {
        this.gameDetailsHandler(message as unknown as GameDetails);
      }
      return;
    }

    // Handle game start response
    if (message.type === 'gamestartres') {
      console.log('Received game start response:', message);
      if (this.gameStartHandler) {
        this.gameStartHandler(message as unknown as GameStartResponse);
      }
      return;
    }

    // Handle cards response
    if (message.type === 'cardsres') {
      console.log('Received cards response:', message);
      if (this.cardsHandler) {
        this.cardsHandler(message as unknown as CardsResponse);
      }
      return;
    }

    // Handle other message types
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