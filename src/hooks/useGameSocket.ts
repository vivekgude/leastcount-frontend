import { useEffect, useRef, useState } from 'react';
import { websocketService } from '@/services/websocket';
import { CardsResponse, GameDetails, GameEnd, GameStartResponse, RoundEnd, StateUpdate, ErrorRes, PickRes, DropRes } from '@/types';

export function useGameSocket(gameId: string | undefined) {
  const [error, setError] = useState('');
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [playerCards, setPlayerCards] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [openPile, setOpenPile] = useState<string[]>([]);
  const [deckCount, setDeckCount] = useState<number>(0);
  const [scores, setScores] = useState<Array<{ playerId: number; total: number }>>([]);
  const [roundSummary, setRoundSummary] = useState<RoundEnd | null>(null);
  const [gameEnd, setGameEnd] = useState<GameEnd | null>(null);
  const [errorToast, setErrorToast] = useState<string>('');
  const [eliminated, setEliminated] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!gameId) return;

    websocketService.connect(gameId, () => {
      websocketService.sendMessage({ type: 'gamedetailsreq', data: '' });
    });

    // Handlers
    const handleGameDetails = (details: GameDetails) => setGameDetails(details);
    const handleGameStart = (response: GameStartResponse) => setGameDetails(prev => prev ? { ...prev, gameState: response.gameState, currentPlayer: response.currentPlayer, moveTime: response.moveTime } : null);
    const handleCards = (response: CardsResponse) => setPlayerCards(response.cards);

    websocketService.setGameDetailsHandler(handleGameDetails);
    websocketService.setGameStartHandler(handleGameStart);
    websocketService.setCardsHandler(handleCards);
    websocketService.setMoveHandler((playerId: number, endTime: number) => {
      setGameDetails(prev => prev ? { ...prev, currentPlayer: playerId, moveTime: endTime } : prev);
      if (typeof window !== 'undefined' && playerId.toString() === localStorage.getItem('userId')) {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        setTimeRemaining(remaining);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          const now2 = Date.now();
          const remaining2 = Math.max(0, endTime - now2);
          setTimeRemaining(remaining2);
          if (remaining2 <= 0 && timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }, 1000);
      }
    });

    const onStateUpdate = (m: StateUpdate) => {
      setOpenPile(m.open || []);
      setDeckCount(m.deckCount || 0);
      if (m.eliminated) setEliminated(m.eliminated);
      if (m.gameScores) {
        const arr = Object.entries(m.gameScores).map(([pid, total]) => ({ playerId: Number(pid), total: Number(total) }));
        setScores(arr);
      }
    };
    const onDropRes = (m: DropRes) => { setOpenPile(m.open); setDeckCount(m.deckCount); };
    const onPickRes = (m: PickRes) => { setOpenPile(m.open); };
    const onRoundEnd = (m: RoundEnd) => { setRoundSummary(m); setScores(m.gameScores); };
    const onGameEnd = (m: GameEnd) => setGameEnd(m);
    const onErrorRes = (m: ErrorRes) => { setErrorToast(m.messageText || m.code); setTimeout(() => setErrorToast(''), 3000); };

    websocketService.on('stateupdate', onStateUpdate);
    websocketService.on('dropres', onDropRes);
    websocketService.on('pickres', onPickRes);
    websocketService.on('roundend', onRoundEnd);
    websocketService.on('gameend', onGameEnd);
    websocketService.on('errorres', onErrorRes);

    return () => {
      websocketService.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameId]);

  return {
    error,
    setError,
    gameDetails,
    setGameDetails,
    playerCards,
    setPlayerCards,
    timeRemaining,
    setTimeRemaining,
    openPile,
    deckCount,
    scores,
    eliminated,
    roundSummary,
    gameEnd,
    errorToast,
  };
}


