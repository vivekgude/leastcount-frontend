import React from 'react';

interface PlayerCardsProps {
  cards: string[];
  gameState: number;
}

const PlayerCards: React.FC<PlayerCardsProps> = ({ cards, gameState }) => {
  // Convert card code to filename format (e.g., "11d" -> "JD.svg")
  const getCardFilename = (cardCode: string) => {
    const value = cardCode.slice(0, -1);
    const suit = cardCode.slice(-1);
    
    // Convert value to card name
    let cardValue = '';
    switch (value) {
      case '11': cardValue = 'J'; break;
      case '12': cardValue = 'Q'; break;
      case '13': cardValue = 'K'; break;
      case '14': cardValue = 'A'; break;
      default: cardValue = value;
    }
    
    // Convert suit to uppercase
    const cardSuit = suit.toUpperCase();
    
    return `${cardValue}${cardSuit}.svg`;
  };

  if (gameState !== 20 || cards.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Cards</h3>
      <div className="flex flex-wrap gap-2">
        {cards.map((card, index) => (
          <div
            key={index}
            className="w-20 h-28 bg-white border-2 border-gray-300 rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={`/cards/${getCardFilename(card)}`}
              alt={`Card ${card}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to card code if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-full h-full flex items-center justify-center text-sm font-bold text-gray-700">
              {card}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerCards; 