import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { websocketService } from '@/services/websocket';
import { GameDetails } from '@/types';

export default function GamePage() {
  const router = useRouter();
  const { gameId } = router.query;
  const [error, setError] = useState('');
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [currentUser, setCurrentUser] = useState('');

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

    // Connect to WebSocket
    try {
      websocketService.connect(gameId as string, () => {
        // Send game details request after connection is confirmed
        websocketService.sendMessage({
          type: 'gamedetailsreq',
          data: ''
        });
      });

      // Set up message handler for game details
      const handleGameDetails = (details: GameDetails) => {
        setGameDetails(details);
      };

      // Add the handler to the websocket service
      websocketService.setGameDetailsHandler(handleGameDetails);

    } catch (err) {
      setError('Failed to connect to game. Please try again.');
      console.error('WebSocket connection error:', err);
    }

    // Cleanup WebSocket connection when component unmounts
    return () => {
      websocketService.disconnect();
    };
  }, [gameId, router]);

  // Filter out current user from the players list
  const otherPlayers = gameDetails?.players.filter(player => player.name !== currentUser) || [];

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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Game Room: {gameId}</h1>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Players Section */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Players in Game</h2>
              
              {/* Current User */}
              <div className="mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">{currentUser}</span>
                  <span className="text-sm text-gray-500">(You)</span>
                </div>
              </div>

              {/* Other Players */}
              {otherPlayers.length > 0 ? (
                <div className="space-y-2">
                  {otherPlayers.map((player, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">{player.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No other players have joined yet...</p>
              )}
            </div>

            {/* Game Status */}
            <div className="mt-4">
              <p className="text-gray-600">
                {gameDetails ? `Players joined: ${gameDetails.players.length}` : 'Waiting for game to start...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 