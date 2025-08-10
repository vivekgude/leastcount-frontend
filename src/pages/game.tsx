import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { websocketService } from '@/services/websocket';
// types are provided by the game socket hook
import { API_ROUTES } from '@/constants';
import PlayerCards from '../components/playercards';
import { useGameSocket } from '@/hooks/useGameSocket';
import { OpenPile } from '@/components/OpenPile';
import { TimerBadge } from '@/components/TimerBadge';
import { Scoreboard } from '@/components/Scoreboard';
import { RoundSummary } from '@/components/RoundSummary';
import { GameEndBanner } from '@/components/GameEndBanner';
import { ErrorToast } from '@/components/ErrorToast';

export default function GamePage() {
  const router = useRouter();
  const { gameId } = router.query;
  const [error, setError] = useState('');
  // game details provided by socket hook
  const [currentUser, setCurrentUser] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const {
    gameDetails,
    playerCards,
    timeRemaining,
    openPile,
    deckCount,
    scores,
    eliminated,
    roundSummary,
    gameEnd,
    errorToast,
  } = useGameSocket(gameId as string | undefined);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Get current user's username
    const username = localStorage.getItem('username');
    setCurrentUser(username || '');

    // Wait for gameId to be available from query params
    if (!gameId) {
      return;
    }

    // Connection managed by useGameSocket hook
    return () => {};
  }, [gameId, router]);

  const handleExitGame = async () => {
    if (!gameId) {
      setError('Game ID not found');
      return;
    }

    setIsExiting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_ROUTES.GAME.EXIT_GAME}/${gameId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to exit game');
      }

      const data = await response.json();
      console.log('Successfully exited game:', data);

      // Disconnect from WebSocket
      websocketService.disconnect();

      // Redirect to home page
      router.push('/home');

    } catch (err) {
      setError('Failed to exit game. Please try again.');
      console.error('Error exiting game:', err);
    } finally {
      setIsExiting(false);
    }
  };

  const handleStartGame = () => {
    if (!gameDetails) return;
    
    websocketService.sendMessage({
      type: 'startgamereq',
      data: ''
    });
  };

  // TimerBadge handles formatting

  const canAct = gameDetails?.gameState === 20 && gameDetails.currentPlayer.toString() === (typeof window !== 'undefined' ? localStorage.getItem('userId') : null);

  const handleDrop = () => {
    if (!canAct || selectedCards.length === 0) return;
    websocketService.drop(selectedCards);
    setSelectedCards([]);
  };

  const handlePickOpen = (card: string) => {
    if (!canAct) return;
    websocketService.pickOpen(card);
  };

  const handlePickClosed = () => {
    if (!canAct) return;
    websocketService.pickClosed();
  };

  if (!gameId) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Game - Least Count</title>
      </Head>
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Game Room: {gameId}</h1>
              <button
                onClick={handleExitGame}
                disabled={isExiting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExiting ? 'Exiting...' : 'Exit Game'}
              </button>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Players Section */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Players in Game</h2>
              
              {/* All Players */}
              {gameDetails?.players && gameDetails.players.length > 0 ? (
                <div className="space-y-2">
                  {gameDetails.players.map((player, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${player.name === currentUser ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      <span className="font-medium text-gray-900">{player.name}</span>
                      {player.name === currentUser && (
                        <span className="text-sm text-gray-500">(You)</span>
                      )}
                      {gameDetails?.host.name === player.name && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">Host</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No players have joined yet...</p>
              )}
            </div>

            {/* Game Status */}
            <div className="mt-4">
              <p className="text-gray-600">
                {gameDetails ? `Players joined: ${gameDetails.players.length}` : 'Waiting for game to start...'}
              </p>
              
              {/* Move Timer */}
              {gameDetails?.gameState === 20 && gameDetails.currentPlayer.toString() === (typeof window !== 'undefined' ? localStorage.getItem('userId') : null) && timeRemaining > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-600 flex items-center gap-2">
                    Your turn! Time remaining: <TimerBadge ms={timeRemaining} />
                  </p>
                </div>
              )}
              
              {/* Start Game Button - Only show for host when game is waiting */}
              {gameDetails?.gameState === 10 && gameDetails.host.name === currentUser && (
                <div className="mt-4">
                  <button
                    onClick={handleStartGame}
                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors font-medium"
                  >
                    Start Game
                  </button>
                </div>
              )}
            </div>

            {/* Open pile and pick controls */}
            {gameDetails?.gameState === 20 && (
              <OpenPile open={openPile} canAct={canAct} onPickOpen={handlePickOpen} deckCount={deckCount} onPickClosed={handlePickClosed} />
            )}

            {/* Player Cards */}
            <PlayerCards 
              cards={playerCards} 
              gameState={gameDetails?.gameState || 0} 
              onCardSelection={setSelectedCards}
              showPlayButton={canAct}
              selectedCardsCount={selectedCards.length}
            />

            {/* Drop action */}
            {canAct && selectedCards.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={handleDrop}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Drop Selected ({selectedCards.length})
                </button>
              </div>
            )}

            {/* Round summary modal */}
            {roundSummary && <RoundSummary data={roundSummary} />}

            {/* Game end banner */}
            {gameEnd && <GameEndBanner data={gameEnd} />}

            {/* Error toast */}
            {errorToast && <ErrorToast message={errorToast} />}

            {/* Scoreboard */}
            <Scoreboard scores={scores} eliminated={eliminated} currentPlayer={gameDetails?.currentPlayer} />
          </div>
        </div>
      </div>
    </>
  );
} 