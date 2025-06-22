import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function JoinGamePage() {
  const router = useRouter();
  const [gameId, setGameId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinGame = async () => {
    if (!gameId.trim()) {
      setError('Please enter a game ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/game/joinGame/${gameId.trim()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to join game');
      }

      const data = await response.json();
      console.log('Successfully joined game:', data);

      // Redirect to game page
      router.push(`/game?gameId=${gameId.trim()}`);

    } catch (err) {
      setError('Failed to join game. Please try again.');
      console.error('Error joining game:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Join Game - Least Count</title>
      </Head>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Join Game</h1>
            <p className="text-gray-600">Enter the game ID to join</p>
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <label htmlFor="gameId" className="sr-only">
                Game ID
              </label>
              <input
                id="gameId"
                name="gameId"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter Game ID"
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleJoinGame}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Joining...' : 'Join Game'}
            </button>

            <button
              onClick={() => router.push('/home')}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 