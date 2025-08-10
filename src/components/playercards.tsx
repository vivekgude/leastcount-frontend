import React, { useState } from 'react';
import { websocketService } from '@/services/websocket';
import { areAllSameRank, getCardFilename } from '@/utils/cards';

interface PlayerCardsProps {
  cards: string[];
  gameState: number;
  onCardSelection?: (selectedCards: string[]) => void;
  showPlayButton?: boolean;
  selectedCardsCount?: number;
}

const PlayerCards: React.FC<PlayerCardsProps> = ({ cards, gameState, onCardSelection, showPlayButton = false, selectedCardsCount = 0 }) => {
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());

  // use shared util for mapping

  const handleCardClick = (index: number) => {
    const newSelectedCards = new Set(selectedCards);
    
    if (newSelectedCards.has(index)) {
      // Unselect card
      newSelectedCards.delete(index);
    } else {
      // Select card
      newSelectedCards.add(index);
    }
    
    setSelectedCards(newSelectedCards);
    
    // Call parent callback with selected card codes
    if (onCardSelection) {
      const selectedCardCodes = Array.from(newSelectedCards).map(index => cards[index]);
      onCardSelection(selectedCardCodes);
    }
  };

  if (gameState !== 20 || cards.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Your Cards</h3>
        {showPlayButton && selectedCardsCount > 0 && (
          <button
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors font-medium shadow-lg"
            onClick={() => {
              const selectedCardCodes = Array.from(selectedCards).map(index => cards[index]);
              if (!areAllSameRank(selectedCardCodes)) {
                return;
              }
              websocketService.drop(selectedCardCodes);
              setSelectedCards(new Set());
            }}
          >
            Play Cards
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {cards.map((card, index) => {
          const isSelected = selectedCards.has(index);
          
          return (
            <div
              key={index}
              className={`relative w-20 h-28 bg-white border-2 rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-blue-500 shadow-lg transform -translate-y-2' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleCardClick(index)}
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
              
              {/* Selection highlight overlay */}
              {isSelected && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-blue-500 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Selection info */}
      {selectedCards.size > 0 && (
        <div className="mt-3 text-sm text-gray-600">
          {selectedCards.size} card{selectedCards.size !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};

export default PlayerCards; 