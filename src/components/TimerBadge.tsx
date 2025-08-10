import React from 'react';

export const TimerBadge: React.FC<{ ms: number }> = ({ ms }) => {
  const seconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-red-100 text-red-700">
      {minutes}:{remainingSeconds.toString().padStart(2, '0')}
    </span>
  );
};


