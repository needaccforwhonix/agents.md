import { describe, it, expect, vi } from 'vitest';
import { LLMBrain } from '../../logic/LLMBrain';
import { Mesh } from '../../logic/Mesh';
import { Agent } from '../../logic/Agent';
import { AgentContext, Message, Brain } from '../../logic/Types';

describe('Table-Driven Network Timeouts and Fail-Fast Boundaries', () => {
  describe('LLMBrain Network Timeouts', () => {
    const defaultContext: AgentContext = {
      id: 'agent-1',
      name: 'Test Agent',
      role: 'Tester',
      history: [],
      parameters: { responsiveness: 1.0 } // Force response
    };

    const defaultMsg: Message = {
      id: 'msg-1',
      senderId: 'agent-2',
      timestamp: Date.now(),
      what: 'test',
      where: 'test',
      how: 'test',
      reasoning: 'test'
    };

    const timeoutCases = [
      {
        name: 'rejects with standard Error("Timeout")',
        error: new Error('Timeout'),
        expected: null
      },
      {
        name: 'rejects with AbortError from AbortController',
        error: new DOMException('Aborted', 'AbortError'),
        expected: null
      },
      {
        name: 'rejects with custom NetworkError string',
        error: 'Network disconnected',
        expected: null
      }
    ];

    it.each(timeoutCases)('should safely handle fetch failures when it $name without crashing (Fail-Fast)', async ({ error, expected }) => {
      const brain = new LLMBrain('http://test.local');

      // Simulate network timeout or explicit abort
      global.fetch = vi.fn().mockRejectedValue(error);

      const result = await brain.decide(defaultMsg, defaultContext);

      expect(result).toBe(expected);
      expect(global.fetch).toHaveBeenCalled();

      vi.restoreAllMocks();
    });
  });

  describe('Mesh Broadcast Resilience (Fail-Fast Boundaries)', () => {
    it('should process queue fully despite an agent throwing errors due to simulated network failure', async () => {
      const mesh = new Mesh(10);

      // Agent 1 works normally
      const brain1 = {
        decide: async () => ({
           id: "reply-1",
           senderId: "agent-1",
           timestamp: Date.now(),
           what: "reply",
           where: "reply",
           how: "reply",
           reasoning: "reply"
        })
      };

      // Agent 2 simulates a hard crash / throw on receiveMessage
      const brain2 = {
        decide: async () => {
           throw new Error("Simulated network/agent failure timeout");
        }
      };

      const agent1 = new Agent("agent-1", "A1", "Role1", brain1 as unknown as Brain, { responsiveness: 1.0 });
      const agent2 = new Agent("agent-2", "A2", "Role2", brain2 as unknown as Brain, { responsiveness: 1.0 });

      mesh.registerAgent(agent1);
      mesh.registerAgent(agent2);

      const initialMessage: Message = {
        id: "initial-msg",
        senderId: "system",
        timestamp: Date.now(),
        what: "start",
        where: "start",
        how: "start",
        reasoning: "start"
      };

      // Broadcast should not throw an error and agent-1's reply should be in the messages queue
      await expect(mesh.broadcast(initialMessage)).resolves.not.toThrow();

      const messages = mesh.getMessages();
      expect(messages.length).toBeGreaterThan(1);
      expect(messages.some(m => m.id === 'initial-msg')).toBe(true);
      expect(messages.some(m => m.id === 'reply-1')).toBe(true);
    });
  });
});
