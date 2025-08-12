import React from 'react';

type Props = {
  open: string[];
  canAct: boolean;
  onPickOpen: (card: string) => void;
  deckCount: number;
  onPickClosed: () => void;
};

export const OpenPile: React.FC<Props> = ({ open, canAct, onPickOpen, deckCount, onPickClosed }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2" id="open-pile-heading">Open Pile</h3>
      {open.length > 0 ? (
        <div className="flex flex-wrap gap-2 items-center" role="group" aria-labelledby="open-pile-heading">
          {open.map((c, idx) => (
            <button
              key={idx}
              disabled={!canAct}
              onClick={() => onPickOpen(c)}
              className={`px-3 py-2 border rounded ${canAct ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
              aria-label={`Pick ${c} from open pile`}
            >
              {c}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">(empty)</p>
      )}
      <div className="mt-3 flex items-center gap-3">
        <button
          disabled={!canAct}
          onClick={onPickClosed}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md ${canAct ? 'hover:bg-blue-700' : 'opacity-50 cursor-not-allowed'}`}
          aria-label={`Pick one card from closed pile. ${deckCount} cards remaining`}
        >
          Pick Closed ({deckCount})
        </button>
      </div>
    </div>
  );
};


