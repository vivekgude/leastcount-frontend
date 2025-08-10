import React from 'react';
import { RoundEnd } from '@/types';

export const RoundSummary: React.FC<{ data: RoundEnd }> = ({ data }) => {
  return (
    <div className="mt-6 p-4 border rounded bg-gray-50">
      <h3 className="font-semibold">Round End</h3>
      <p>Winner: {data.winnerId}</p>
      <div className="mt-2">
        <div className="text-sm text-gray-600">Per-player added</div>
        <ul className="list-disc list-inside">
          {data.perPlayerAdded.map((r, i) => (
            <li key={i}>{r.playerId}: +{r.added}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};


