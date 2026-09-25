import { describe, it, expect } from 'vitest';
import { countTokens, boundHistory } from '../../logic/ACE';
import { Message } from '../../logic/Types';

describe('ACE (Agentic Context Engineering)', () => {
  describe('countTokens', () => {
    it('should approximate token count as length divided by 4', () => {
      expect(countTokens('')).toBe(0);
      expect(countTokens('1234')).toBe(1);
      expect(countTokens('12345')).toBe(2);
      expect(countTokens('hello world')).toBe(3); // 11 / 4 = 2.75 -> 3
    });
  });

  describe('boundHistory', () => {
    it('should keep history within token limit', () => {
      const msgs: Message[] = [
        { id: '1', senderId: 's1', timestamp: 1, what: 'A', where: 'B', how: 'C', reasoning: 'D' }, // length: 1 + 1 + 1 + 1 + 3 spaces = 7 -> 2 tokens
        { id: '2', senderId: 's2', timestamp: 2, what: 'EE', where: 'FF', how: 'GG', reasoning: 'HH' }, // length: 2 + 2 + 2 + 2 + 3 spaces = 11 -> 3 tokens
      ];

      const bounded = boundHistory(msgs, 4); // maxTokens = 4
      expect(bounded.length).toBe(1);
      expect(bounded[0].id).toBe('2'); // Should keep the most recent message
    });

    it('should keep all messages if within limit', () => {
      const msgs: Message[] = [
        { id: '1', senderId: 's1', timestamp: 1, what: 'A', where: 'B', how: 'C', reasoning: 'D' },
        { id: '2', senderId: 's2', timestamp: 2, what: 'E', where: 'F', how: 'G', reasoning: 'H' },
      ];

      const bounded = boundHistory(msgs, 10);
      expect(bounded.length).toBe(2);
      expect(bounded[0].id).toBe('1');
      expect(bounded[1].id).toBe('2');
    });

    it('should handle empty history', () => {
      expect(boundHistory([], 10)).toEqual([]);
    });
  });
});
