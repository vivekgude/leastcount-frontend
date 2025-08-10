import React from 'react';
import { GameEnd } from '@/types';

export const GameEndBanner: React.FC<{ data: GameEnd }> = ({ data }) => {
  return (
    <div className="mt-6 p-4 border rounded bg-green-50">
      <h3 className="font-semibold">Game End</h3>
      <p>Winner: {data.winnerId}</p>
      <div className="mt-2">
        <div className="text-sm text-gray-600">Final Scores</div>
        <ul className="list-disc list-inside">
          {data.finalScores.map((s, i) => (
            <li key={i}>#{s.playerId}: {s.total}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};


