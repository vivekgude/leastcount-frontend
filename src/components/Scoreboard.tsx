import React from 'react';

type Props = {
  scores: Array<{ playerId: number; total: number }>;
  eliminated?: number[];
  currentPlayer?: number;
};

export const Scoreboard: React.FC<Props> = ({ scores, eliminated = [], currentPlayer }) => {
  if (!scores || scores.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Scores</h3>
      <ul className="divide-y rounded border">
        {scores.map(s => (
          <li key={s.playerId} className="flex justify-between px-3 py-2 text-sm">
            <span>
              #{s.playerId}
              {currentPlayer === s.playerId && <span className="ml-2 text-blue-600">(turn)</span>}
              {eliminated.includes(s.playerId) && <span className="ml-2 text-red-600">(eliminated)</span>}
            </span>
            <span className="font-medium">{s.total}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};


