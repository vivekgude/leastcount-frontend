import React from 'react';
import { render, screen } from '@testing-library/react';
import GamePage from '../game';
import * as useGameSocketModule from '@/hooks/useGameSocket';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useGameSocket');

// Mock websocket service methods used by the page to avoid errors
jest.mock('@/services/websocket', () => ({
  websocketService: {
    disconnect: jest.fn(),
    sendMessage: jest.fn(),
    drop: jest.fn(),
    pickOpen: jest.fn(),
    pickClosed: jest.fn(),
  },
}));

describe('Game controls gating by current player and gameState', () => {
  const mockUseRouter = useRouter as jest.Mock;
  const mockUseGameSocket = useGameSocketModule as unknown as { useGameSocket: jest.Mock };

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      query: { gameId: 'G1' },
      push: jest.fn(),
    });

    // Ensure localStorage userId is present for canAct comparisons
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => {
          if (key === 'token') return 't';
          if (key === 'userId') return '101';
          if (key === 'username') return 'alice';
          return null;
        },
      },
      configurable: true,
    });
  });

  function setup(gameState: number, currentPlayer: number) {
    mockUseGameSocket.useGameSocket.mockReturnValue({
      gameDetails: {
        gameState,
        players: [{ name: 'alice', id: 101 }],
        host: { name: 'alice', id: 101 },
        currentPlayer,
        moveTime: Date.now() + 30000,
      },
      playerCards: ['7h', '7s'],
      timeRemaining: 20000,
      openPile: ['8h'],
      deckCount: 50,
      scores: [],
      eliminated: [],
      roundSummary: null,
      gameEnd: null,
      errorToast: '',
    });
  }

  test('controls enabled when it is your turn and game in progress', () => {
    setup(20, 101);
    render(<GamePage />);
    expect(screen.getByText('Pick Closed (50)')).toBeEnabled();
  });

  test('controls disabled when not your turn', () => {
    setup(20, 102);
    render(<GamePage />);
    expect(screen.getByText('Pick Closed (50)')).toBeDisabled();
  });

  test('controls hidden when game not in progress', () => {
    setup(10, 101);
    render(<GamePage />);
    expect(screen.queryByText('Pick Closed (50)')).toBeNull();
  });
});


