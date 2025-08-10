import { areAllSameRank, getCardFilename } from './cards';

describe('cards utils', () => {
  test('areAllSameRank returns true for same rank', () => {
    expect(areAllSameRank(['7h', '7s', '7d'])).toBe(true);
  });
  test('areAllSameRank returns false for mixed rank', () => {
    expect(areAllSameRank(['7h', '8s'])).toBe(false);
  });
  test('getCardFilename maps ranks including face and ten', () => {
    expect(getCardFilename('1h')).toBe('AH.svg');
    expect(getCardFilename('10d')).toBe('TD.svg');
    expect(getCardFilename('11s')).toBe('JS.svg');
    expect(getCardFilename('12c')).toBe('QC.svg');
    expect(getCardFilename('13h')).toBe('KH.svg');
    expect(getCardFilename('9s')).toBe('9S.svg');
  });
});


