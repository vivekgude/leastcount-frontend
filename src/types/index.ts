export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password';
  required: boolean;
  placeholder?: string;
}

export interface Player {
  id: number;
  name: string;
}

export interface GameDetails {
  gameState: number;
  host: Player;
  players: Player[];
  currentPlayer: number;
  moveTime: number;
  receiver: number;
}

export interface GameStartResponse {
  gameState: number;
  currentPlayer: number;
  moveTime: number;
  type: string;
  receiver: number;
}

export interface CardsResponse {
  gameId: string;
  cards: string[];
  type: string;
  receiver: number;
}

// Generic WebSocket message that can contain any properties
export type WebSocketMessage = Record<string, string | number | boolean | object | Array<unknown>>; 

// Typed WS DTOs from backend
export interface StateUpdate {
  type: 'stateupdate';
  currentPlayer: number;
  moveTime: number;
  open: string[];
  deckCount: number;
  gameScores?: Record<string, string>;
  eliminated?: number[];
  roundNo?: number;
}

export interface DropRes {
  type: 'dropres';
  playerId: number;
  open: string[];
  deckCount: number;
  receiver?: number;
}

export interface PickRes {
  type: 'pickres';
  playerId: number;
  source: 'open' | 'closed';
  card?: string;
  open: string[];
  receiver?: number;
}

export interface RoundEnd {
  type: 'roundend';
  winnerId: number;      // -1 if invalid declaration
  winnerTotal: number;   // -1 if invalid declaration
  perPlayerAdded: Array<{ playerId: number; added: number }>;
  gameScores: Array<{ playerId: number; total: number }>;
}

export interface GameEnd {
  type: 'gameend';
  winnerId: number; // -1 when no players
  finalScores: Array<{ playerId: number; total: number }>;
}

export interface ErrorRes {
  type: 'errorres';
  code: string;
  messageText: string;
  receiver: number;
}