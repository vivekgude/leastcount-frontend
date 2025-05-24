import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Card {
  id: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: number;
}

interface Player {
  id: string;
  name: string;
  hand: Card[];
  score: number;
}

interface GameState {
  players: Player[];
  currentPlayer: string | null;
  deck: Card[];
  gameStatus: 'waiting' | 'playing' | 'finished';
  round: number;
}

const initialState: GameState = {
  players: [],
  currentPlayer: null,
  deck: [],
  gameStatus: 'waiting',
  round: 0,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initializeGame: (state, action: PayloadAction<Player[]>) => {
      state.players = action.payload;
      state.gameStatus = 'playing';
      state.round = 1;
    },
    setCurrentPlayer: (state, action: PayloadAction<string>) => {
      state.currentPlayer = action.payload;
    },
    updatePlayerHand: (state, action: PayloadAction<{ playerId: string; cards: Card[] }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (player) {
        player.hand = action.payload.cards;
      }
    },
    updatePlayerScore: (state, action: PayloadAction<{ playerId: string; score: number }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (player) {
        player.score = action.payload.score;
      }
    },
    setDeck: (state, action: PayloadAction<Card[]>) => {
      state.deck = action.payload;
    },
    nextRound: (state) => {
      state.round += 1;
    },
    endGame: (state) => {
      state.gameStatus = 'finished';
    },
  },
});

export const {
  initializeGame,
  setCurrentPlayer,
  updatePlayerHand,
  updatePlayerScore,
  setDeck,
  nextRound,
  endGame,
} = gameSlice.actions;

export default gameSlice.reducer; 