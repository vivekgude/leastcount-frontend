import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { websocketService } from '@/services/websocket';

export default function GamePage() {
  const router = useRouter();
  const { gameId } = router.query;
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

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
    } catch (err) {
      setError('Failed to connect to game. Please try again.');
      console.error('WebSocket connection error:', err);
    }

    // Cleanup WebSocket connection when component unmounts
    return () => {
      websocketService.disconnect();
    };
  }, [gameId, router]);

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

            {/* Game content will go here */}
            <div className="mt-4">
              <p className="text-gray-600">Waiting for game to start...</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 