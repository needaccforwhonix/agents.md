import { describe, it, expect } from 'vitest';
import { countTokens, boundHistory } from '../../logic/ACE';
import { Message } from '../../logic/Types';

describe('ACE (Agentic Context Engineering) Unit Tests', () => {
  describe('countTokens', () => {
    it('should calculate tokens correctly based on string length', () => {
      const testCases = [
        { input: '', expected: 0 },
        { input: '1234', expected: 1 },
        { input: '12345', expected: 2 },
        { input: 'a much longer string that should be counted appropriately', expected: 15 },
      ];

      for (const tc of testCases) {
        expect(countTokens(tc.input)).toBe(tc.expected);
      }
    });
  });

  describe('boundHistory', () => {
    const createMessage = (id: string, size: number): Message => {
      return {
        id,
        senderId: 'sender1',
        timestamp: Date.now(),
        what: 'a'.repeat(size),
        where: '',
        how: '',
        reasoning: ''
      };
    };

    it('should keep messages if under the limit', () => {
      const history = [
        createMessage('msg1', 4),
        createMessage('msg2', 4),
      ];

      const bounded = boundHistory(history, 10);
      expect(bounded.length).toBe(2);
      expect(bounded[0].id).toBe('msg1');
      expect(bounded[1].id).toBe('msg2');
    });

    it('should drop older messages when exceeding token limit', () => {
      const history = [
        createMessage('msg1', 12),
        createMessage('msg2', 12),
        createMessage('msg3', 12),
      ];
      const bounded = boundHistory(history, 10);
      expect(bounded.length).toBe(2);
      expect(bounded[0].id).toBe('msg2');
      expect(bounded[1].id).toBe('msg3');
    });

    it('should drop all but the last message if the last message takes up all tokens', () => {
      const history = [
        createMessage('msg1', 20),
        createMessage('msg2', 40),
      ];

      const bounded = boundHistory(history, 11);
      expect(bounded.length).toBe(1);
      expect(bounded[0].id).toBe('msg2');
    });

    it('should return empty array if even the latest message exceeds the limit', () => {
      const history = [
        createMessage('msg1', 40),
      ];

      const bounded = boundHistory(history, 5);
      expect(bounded.length).toBe(0);
    });
  });
});
