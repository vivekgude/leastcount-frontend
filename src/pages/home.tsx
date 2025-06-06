import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { websocketService } from '@/services/websocket';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleCreateGame = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/game/createGame', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create game');
      }

      const data = await response.json();
      console.log('Game created:', data);

      // Redirect to game page
      if (data.data?.gameId) {
        router.push(`/game?gameId=${data.data.gameId}`);
      }

    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handleJoinGame = () => {
    router.push('/join-game');
  };

  return (
    <>
      <Head>
        <title>Home - Least Count</title>
      </Head>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Least Count</h1>
            <p className="text-gray-600">Choose an option to start playing</p>
          </div>
          
          <div className="mt-8 space-y-4">
            <button
              onClick={handleCreateGame}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Create Game
            </button>
            
            <button
              onClick={handleJoinGame}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Join Game
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                localStorage.clear();
                router.push('/login');
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 