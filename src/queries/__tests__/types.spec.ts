import { isTextMatch, matchText } from '../types';

describe('types', () => {
  describe('isTextMatch', () => {
    it('returns true for string', () => {
      expect(isTextMatch('Button')).toBe(true);
    });

    it('returns true for RegExp', () => {
      expect(isTextMatch(/Button/)).toBe(true);
    });

    it('returns true for function', () => {
      expect(isTextMatch(() => true)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isTextMatch(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isTextMatch(undefined)).toBe(false);
    });
  });

  describe('matchText', () => {
    it('matches exact string', () => {
      expect(matchText('Button', 'Button')).toBe(true);
    });

    it('does not match different string', () => {
      expect(matchText('Button', 'Input')).toBe(false);
    });

    it('matches regex pattern', () => {
      expect(matchText(/but/i, 'Button')).toBe(true);
    });

    it('does not match non-matching regex', () => {
      expect(matchText(/input/i, 'Button')).toBe(false);
    });

    it('calls predicate function', () => {
      const predicate = (text: string) => text.startsWith('But');
      expect(matchText(predicate, 'Button')).toBe(true);
    });

    it('returns false when predicate returns false', () => {
      const predicate = (text: string) => text.startsWith('In');
      expect(matchText(predicate, 'Button')).toBe(false);
    });
  });
});
