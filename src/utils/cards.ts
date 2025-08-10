export function getCardFilename(cardCode: string): string {
  const value = cardCode.slice(0, -1);
  const suit = cardCode.slice(-1).toUpperCase();
  let cardValue = '';
  switch (value) {
    case '1': cardValue = 'A'; break;
    case '10': cardValue = 'T'; break;
    case '11': cardValue = 'J'; break;
    case '12': cardValue = 'Q'; break;
    case '13': cardValue = 'K'; break;
    default: cardValue = value;
  }
  return `${cardValue}${suit}.svg`;
}

export function extractRank(cardCode: string): string {
  if (!cardCode) return '';
  return cardCode.slice(0, -1);
}

export function areAllSameRank(cards: string[]): boolean {
  if (!cards || cards.length === 0) return true;
  const rank = extractRank(cards[0]);
  return cards.every(c => extractRank(c) === rank);
}

