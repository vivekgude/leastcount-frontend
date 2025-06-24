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