// import { store } from '@/store/store';
// import { setCurrentPlayer, updatePlayerHand } from '@/store/features/gameSlice';
import { Message } from '@/model/message';
import { GameDetails, WebSocketMessage, GameStartResponse, CardsResponse, StateUpdate, DropRes, PickRes, RoundEnd, GameEnd, ErrorRes } from '@/types';

type EventPayloads = {
  stateupdate: StateUpdate;
  dropres: DropRes;
  pickres: PickRes;
  roundend: RoundEnd;
  gameend: GameEnd;
  errorres: ErrorRes;
  gamestartres: GameStartResponse;
  cardsres: CardsResponse;
  gamedetailsres: GameDetails;
};

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 6;
  private backoffBaseMs = 1000; // exponential backoff base
  private onConnectCallback: (() => void) | null = null;
  private isIntentionalDisconnect = false;
  private pendingQueue: string[] = [];
  private currentGameId: string | null = null;
  private listeners: Map<string, Set<(payload: unknown) => void>> = new Map();
  // lightweight cache of last known state snapshot
  private lastState: Partial<StateUpdate> = {};

  // Back-compat explicit handlers
  private gameDetailsHandler: ((details: GameDetails) => void) | null = null;
  private gameStartHandler: ((response: GameStartResponse) => void) | null = null;
  private cardsHandler: ((response: CardsResponse) => void) | null = null;
  private moveHandler: ((playerId: number, moveTime: number) => void) | null = null;
  private scoreHandler: ((scores: Array<{ playerId: number; score: number }>) => void) | null = null;

  connect(gameId: string, onConnect?: () => void) {
    this.currentGameId = gameId;
    this.onConnectCallback = onConnect || null;
    this.isIntentionalDisconnect = false;

    const wsUrl = this.buildWsUrl(gameId);
    const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : undefined;
    try {
      this.socket = new WebSocket(wsUrl, [token || '']);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.flushQueue();
        if (this.onConnectCallback) this.onConnectCallback();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        const wasAuthFailure = event.code === 1008 || event.code === 1006;
        if (!this.isIntentionalDisconnect && !wasAuthFailure && this.currentGameId) {
          this.scheduleReconnect(this.currentGameId);
        }
      };

      this.socket.onerror = (error) => {
        // Let onclose drive reconnection
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      if (this.currentGameId) this.scheduleReconnect(this.currentGameId);
    }
  }

  disconnect() {
    this.isIntentionalDisconnect = true;
    if (this.socket) {
      try { this.socket.close(); } catch {}
      this.socket = null;
    }
    this.reconnectAttempts = 0;
    this.pendingQueue = [];
  }

  private buildWsUrl(gameId: string): string {
    const configured = process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, '');
    if (configured) return `${configured}/ws?gameId=${gameId}`;
    if (typeof window !== 'undefined' && window.location) {
      // If running on Vercel frontend domain, direct to backend WS host
      const host = window.location.host;
      if (host.endsWith('vercel.app')) {
        return `wss://leastcount.duckdns.org/ws?gameId=${gameId}`;
      }
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      return `${protocol}://${host}/ws?gameId=${gameId}`;
    }
    // Fallback to deployed domain
    return `wss://leastcount.duckdns.org/ws?gameId=${gameId}`;
  }

  private scheduleReconnect(gameId: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = Math.min(15000, this.backoffBaseMs * Math.pow(2, this.reconnectAttempts - 1));
    setTimeout(() => this.connect(gameId), delay);
  }

  private flushQueue() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    while (this.pendingQueue.length) {
      const msg = this.pendingQueue.shift();
      if (msg) this.socket.send(msg);
    }
  }

  // Event API
  on<K extends keyof EventPayloads>(type: K, handler: (payload: EventPayloads[K]) => void): void {
    if (!this.listeners.has(type as string)) this.listeners.set(type as string, new Set());
    this.listeners.get(type as string)!.add(handler as (p: unknown) => void);
  }

  off<K extends keyof EventPayloads>(type: K, handler: (payload: EventPayloads[K]) => void): void {
    this.listeners.get(type as string)?.delete(handler as (p: unknown) => void);
  }

  private emit(type: string, payload: unknown) {
    const ls = this.listeners.get(type);
    if (ls) ls.forEach((fn) => {
      try { fn(payload); } catch (e) { console.error('Listener error', e); }
    });
  }

  // Legacy handler setters (kept for compatibility)
  setGameDetailsHandler(handler: (details: GameDetails) => void) { this.gameDetailsHandler = handler; }
  setGameStartHandler(handler: (response: GameStartResponse) => void) { this.gameStartHandler = handler; }
  setCardsHandler(handler: (response: CardsResponse) => void) { this.cardsHandler = handler; }
  setMoveHandler(handler: (playerId: number, moveTime: number) => void) { this.moveHandler = handler; }
  setScoreHandler(handler: (scores: Array<{ playerId: number; score: number }>) => void) { this.scoreHandler = handler; }

  private handleMessage(message: WebSocketMessage) {
    const msg = message as Record<string, unknown>;
    // Emit by type when present
    if (typeof msg.type === 'string') this.emit(msg.type, message);

    // Game details heuristic (no type in payload)
    if ('gameState' in msg && 'players' in msg) {
      if (this.gameDetailsHandler) this.gameDetailsHandler(message as unknown as GameDetails);
      this.emit('gamedetailsres', message);
      return;
    }

    const typeStr = typeof msg.type === 'string' ? (msg.type as string) : '';
    // Typed messages
    switch (typeStr) {
      case 'gamestartres':
        if (this.gameStartHandler) this.gameStartHandler(message as unknown as GameStartResponse);
        break;
      case 'cardsres':
        if (this.cardsHandler) this.cardsHandler(message as unknown as CardsResponse);
        break;
      case 'stateupdate': {
        const m = message as unknown as StateUpdate;
        this.lastState = { ...this.lastState, ...m };
        this.emit('stateupdate', m);
        break;
      }
      case 'dropres': {
        const m = message as unknown as DropRes;
        this.lastState.open = m.open;
        this.lastState.deckCount = m.deckCount;
        this.emit('dropres', m);
        break;
      }
      case 'pickres': {
        const m = message as unknown as PickRes;
        this.lastState.open = m.open;
        this.emit('pickres', m);
        break;
      }
      case 'roundend':
        this.emit('roundend', message as unknown as RoundEnd);
        break;
      case 'gameend':
        this.emit('gameend', message as unknown as GameEnd);
        break;
      case 'errorres':
        this.emit('errorres', message as unknown as ErrorRes);
        break;
      case 'playermove': {
        const m = message as unknown as { playerId: number; moveTime: number };
        if (this.moveHandler) this.moveHandler(m.playerId, m.moveTime);
        break;
      }
      case 'scoreres': {
        const m = message as unknown as { scores: Array<{ playerId: number; score: number }> };
        if (this.scoreHandler) this.scoreHandler(m.scores);
        break;
      }
      default:
        // Unknown or unhandled type
        break;
    }
  }

  // Send helpers
  sendRaw(raw: unknown) {
    const payload = typeof raw === 'string' ? raw : JSON.stringify(raw);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(payload);
    } else {
      this.pendingQueue.push(payload);
    }
  }

  sendMessage(message: Message): void {
    this.sendRaw(message);
  }

  // Send helpers for protocol
  drop(cards: string[]): void {
    this.sendRaw({ type: 'dropreq', content: JSON.stringify({ cards }) });
  }

  pickOpen(card: string): void {
    this.sendRaw({ type: 'pickreq', content: JSON.stringify({ source: 'open', card }) });
  }

  pickClosed(): void {
    this.sendRaw({ type: 'pickreq', content: JSON.stringify({ source: 'closed' }) });
  }
}

export const websocketService = new WebSocketService();