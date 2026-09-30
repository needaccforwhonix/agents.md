import { describe, it, expect, vi } from 'vitest';
import { LLMBrain } from '../../logic/LLMBrain';
import { AgentContext, Message } from '../../logic/Types';

describe('LLMBrain', () => {
  it('should throw error if message or context is undefined', async () => {
    const brain = new LLMBrain();
    await expect(brain.decide(null as unknown as Message, {} as AgentContext)).rejects.toThrow("Input message cannot be null or undefined");
  });

  it('should return null if sender is the same as context id', async () => {
    const brain = new LLMBrain();
    const context: AgentContext = { id: 'agent-1', name: 'Agent 1', role: 'Role', history: [], parameters: { responsiveness: 1.0 } };
    const msg: Message = { id: 'msg-1', senderId: 'agent-1', timestamp: Date.now(), what: 'w', where: 'w', how: 'h', reasoning: 'r' };
    const result = await brain.decide(msg, context);
    expect(result).toBeNull();
  });

  it('should return null if responsiveness check fails', async () => {
    const brain = new LLMBrain();
    const context: AgentContext = { id: 'agent-1', name: 'Agent 1', role: 'Role', history: [], parameters: { responsiveness: 0.0 } };
    const msg: Message = { id: 'msg-1', senderId: 'agent-2', timestamp: Date.now(), what: 'w', where: 'w', how: 'h', reasoning: 'r' };
    const result = await brain.decide(msg, context);
    expect(result).toBeNull();
  });

  it('should make a fetch call and return parsed message', async () => {
    const brain = new LLMBrain('http://test.local');
    const context: AgentContext = { id: 'agent-1', name: 'Agent 1', role: 'Role', history: [], parameters: { responsiveness: 1.0 } };
    const msg: Message = { id: 'msg-1', senderId: 'agent-2', timestamp: Date.now(), what: 'w', where: 'w', how: 'h', reasoning: 'r' };

    const mockResponse = {
      ok: true,
      json: async () => ({
        response: JSON.stringify({
          what: 'test what',
          where: 'test where',
          how: 'test how',
          reasoning: 'test reasoning'
        })
      })
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse as unknown as Response);

    const result = await brain.decide(msg, context);
    expect(result).not.toBeNull();
    expect(result?.what).toBe('test what');
    expect(result?.where).toBe('test where');
    expect(result?.how).toBe('test how');
    expect(result?.reasoning).toBe('test reasoning');
  });

  it('should return null if fetch throws', async () => {
    const brain = new LLMBrain('http://test.local');
    const context: AgentContext = { id: 'agent-1', name: 'Agent 1', role: 'Role', history: [], parameters: { responsiveness: 1.0 } };
    const msg: Message = { id: 'msg-1', senderId: 'agent-2', timestamp: Date.now(), what: 'w', where: 'w', how: 'h', reasoning: 'r' };

    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await brain.decide(msg, context);
    expect(result).toBeNull();
  });

  it('should return null when response.ok is false', async () => {
    const brain = new LLMBrain('http://test.local');
    const context: AgentContext = { id: 'agent-1', name: 'Agent 1', role: 'Role', history: [], parameters: { responsiveness: 1.0 } };
    const msg: Message = { id: 'msg-1', senderId: 'agent-2', timestamp: Date.now(), what: 'w', where: 'w', how: 'h', reasoning: 'r' };

    const mockResponse = {
      ok: false,
      status: 500,
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse as unknown as Response);

    const result = await brain.decide(msg, context);
    expect(result).toBeNull();
  });

  it('should include Authorization header if apiKey is provided', async () => {
    const brain = new LLMBrain('http://test.local', 'test-api-key');
    const context: AgentContext = { id: 'agent-1', name: 'Agent 1', role: 'Role', history: [], parameters: { responsiveness: 1.0 } };
    const msg: Message = { id: 'msg-1', senderId: 'agent-2', timestamp: Date.now(), what: 'w', where: 'w', how: 'h', reasoning: 'r' };

    const mockResponse = {
      ok: false,
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse as unknown as Response);

    await brain.decide(msg, context);

    expect(global.fetch).toHaveBeenCalledWith('http://test.local', expect.objectContaining({
      headers: expect.objectContaining({
        'Authorization': 'Bearer test-api-key',
      }),
    }));
  });

  describe('Table-Driven Logic Gate Verification', () => {
    const defaultContext: AgentContext = { id: 'agent-1', name: 'Agent 1', role: 'Role', history: [], parameters: { responsiveness: 1.0 } };
    const defaultMsg: Message = { id: 'msg-1', senderId: 'agent-2', timestamp: Date.now(), what: 'w', where: 'w', how: 'h', reasoning: 'r' };

    const edgeCases = [
      {
        name: 'empty inputs - null message',
        msg: null as unknown as Message,
        ctx: defaultContext,
        expected: 'error-msg'
      },
      {
        name: 'empty inputs - undefined message',
        msg: undefined as unknown as Message,
        ctx: defaultContext,
        expected: 'error-msg'
      },
      {
        name: 'empty inputs - null context',
        msg: defaultMsg,
        ctx: null as unknown as AgentContext,
        expected: 'error-ctx'
      },
      {
        name: 'maximum token limits - very long message fields',
        msg: { ...defaultMsg, what: 'a'.repeat(10000), where: 'b'.repeat(10000), how: 'c'.repeat(10000), reasoning: 'd'.repeat(10000) },
        ctx: defaultContext,
        expected: 'truncate'
      },
      {
        name: 'network timeouts - fetch throws',
        msg: defaultMsg,
        ctx: defaultContext,
        setupFetch: () => vi.fn().mockRejectedValue(new Error('Network timeout')),
        expected: null
      }
    ];

    for (const testCase of edgeCases) {
      it(`should handle ${testCase.name}`, async () => {
        const brain = new LLMBrain('http://test.local');

        if (testCase.setupFetch) {
          global.fetch = testCase.setupFetch();
        } else {
           const mockResponse = {
             ok: true,
             json: async () => ({
               response: JSON.stringify({
                 what: 'test what',
                 where: 'test where',
                 how: 'test how',
                 reasoning: 'test reasoning'
               })
             })
           };
           global.fetch = vi.fn().mockResolvedValue(mockResponse as unknown as Response);
        }

        if (testCase.expected === 'error-msg') {
          await expect(brain.decide(testCase.msg, testCase.ctx)).rejects.toThrow("Input message cannot be null or undefined");
        } else if (testCase.expected === 'error-ctx') {
          await expect(brain.decide(testCase.msg, testCase.ctx)).rejects.toThrow("Input context cannot be null or undefined");
        } else {
          const result = await brain.decide(testCase.msg, testCase.ctx);

          if (testCase.expected === null) {
            expect(result).toBeNull();
          } else if (testCase.expected === 'truncate') {
            expect(result).not.toBeNull();
            expect(global.fetch).toHaveBeenCalled();
            const callArgs = vi.mocked(global.fetch).mock.calls[0];
            const requestBody = JSON.parse(callArgs[1]?.body as string);
            expect(requestBody.prompt).not.toContain('a'.repeat(5000));
            expect(requestBody.prompt).toContain('a'.repeat(4000) + '...');
          }
        }
      });
    }
  });

  describe('Uncovered branches in LLMBrain', () => {
    it('should default chanceToRespond to 0.5 if parameters are undefined', async () => {
      const brain = new LLMBrain('http://test.local');
      const context: AgentContext = { id: 'agent-1', name: 'Agent 1', role: 'Role', history: [], parameters: undefined as unknown as Record<string, number> };
      const msg: Message = { id: 'msg-1', senderId: 'agent-2', timestamp: Date.now(), what: 'w', where: 'w', how: 'h', reasoning: 'r' };

      vi.spyOn(Math, 'random').mockReturnValue(0.4); // Less than 0.5, so it responds

      const mockResponse = {
        ok: true,
        json: async () => ({
          response: JSON.stringify({
            what: 'test what',
            where: 'test where',
            how: 'test how',
            reasoning: 'test reasoning'
          })
        })
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse as unknown as Response);

      const result = await brain.decide(msg, context);
      expect(result).not.toBeNull();

      vi.restoreAllMocks();
    });

    it('should default chanceToRespond to 0.5 if responsiveness is undefined', async () => {
      const brain = new LLMBrain('http://test.local');
      const context: AgentContext = { id: 'agent-1', name: 'Agent 1', role: 'Role', history: [], parameters: {} };
      const msg: Message = { id: 'msg-1', senderId: 'agent-2', timestamp: Date.now(), what: 'w', where: 'w', how: 'h', reasoning: 'r' };

      vi.spyOn(Math, 'random').mockReturnValue(0.4); // Less than 0.5, so it responds

      const mockResponse = {
        ok: true,
        json: async () => ({
          response: JSON.stringify({
            what: 'test what',
            where: 'test where',
            how: 'test how',
            reasoning: 'test reasoning'
          })
        })
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse as unknown as Response);

      const result = await brain.decide(msg, context);
      expect(result).not.toBeNull();

      vi.restoreAllMocks();
    });

    it('should use default reasoning if message reasoning is missing', async () => {
      const brain = new LLMBrain('http://test.local');
      const context: AgentContext = { id: 'agent-1', name: 'Agent 1', role: 'Role', history: [], parameters: { responsiveness: 1.0 } };
      const msg: Message = { id: 'msg-1', senderId: 'agent-2', timestamp: Date.now(), what: 'w', where: 'w', how: 'h', reasoning: undefined as unknown as string };

      const mockResponse = {
        ok: true,
        json: async () => ({
          response: JSON.stringify({
            what: 'test what',
            where: 'test where',
            how: 'test how',
            reasoning: 'test reasoning'
          })
        })
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse as unknown as Response);

      const result = await brain.decide(msg, context);
      expect(result).not.toBeNull();

      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1]?.body as string);
      expect(requestBody.prompt).toContain('Reasoning: \n');

      vi.restoreAllMocks();
    });

    it('should use default values for parsed JSON fields if they are missing', async () => {
      const brain = new LLMBrain('http://test.local');
      const context: AgentContext = { id: 'agent-1', name: 'Agent 1', role: 'Role', history: [], parameters: { responsiveness: 1.0 } };
      const msg: Message = { id: 'msg-1', senderId: 'agent-2', timestamp: Date.now(), what: 'test-what', where: 'test-where', how: 'test-how', reasoning: 'test-reasoning' };

      const mockResponse = {
        ok: true,
        json: async () => ({
          response: JSON.stringify({}) // Missing fields
        })
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse as unknown as Response);

      const result = await brain.decide(msg, context);
      expect(result).not.toBeNull();
      expect(result?.what).toContain('(WAS) Analysiere, refaktorisiere und wende kontinuierliche Optimierung an basierend auf [test-what]');
      expect(result?.where).toContain('(WO) Context: Agent 1 verarbeitet Aufgabe basierend auf [test-where]');
      expect(result?.how).toContain('(WIE) Reagiert auf vorherige Aktion [test-how]');
      expect(result?.reasoning).toContain('(WARUM) Als Role muss ich sicherstellen, dass asynchrone, parallele Verbesserungen streng additiv sind (ohne Funktions-/Feature-Verlust), aufbauend auf [test-reasoning]');

      vi.restoreAllMocks();
    });
  });
  describe('Table-Driven Edge Case and Boundary Validation', () => {
    const defaultContext: AgentContext = { id: 'agent-llm', name: 'Agent 1', role: 'Role', history: [], parameters: { responsiveness: 1.0 } };
    const defaultMsg: Message = { id: 'msg-llm', senderId: 'agent-other', timestamp: Date.now(), what: 'w', where: 'w', how: 'h', reasoning: 'r' };

    const edgeCases = [
      {
        name: 'null message throws error',
        msg: null as unknown as Message,
        ctx: defaultContext,
        expectedError: 'Input message cannot be null or undefined'
      },
      {
        name: 'undefined message throws error',
        msg: undefined as unknown as Message,
        ctx: defaultContext,
        expectedError: 'Input message cannot be null or undefined'
      },
      {
        name: 'null context throws error',
        msg: defaultMsg,
        ctx: null as unknown as AgentContext,
        expectedError: 'Input context cannot be null or undefined'
      },
      {
        name: 'undefined context throws error',
        msg: defaultMsg,
        ctx: undefined as unknown as AgentContext,
        expectedError: 'Input context cannot be null or undefined'
      }
    ];

    for (const testCase of edgeCases) {
      it(`should handle ${testCase.name}`, async () => {
        const brain = new LLMBrain();
        await expect(brain.decide(testCase.msg, testCase.ctx)).rejects.toThrow(testCase.expectedError);
      });
    }

    it('should gracefully handle network timeouts using AbortController', async () => {
      const brain = new LLMBrain();
      global.fetch = vi.fn().mockImplementation(async (url, init) => {
        return new Promise((_, reject) => {
          // Instead of rejecting immediately, we simulate a very slow request
          // that will trigger the controller.abort() which will fire the abort event
          const timeout = setTimeout(() => { /* slow response */ }, 20000);

          if (init?.signal) {
             init.signal.addEventListener('abort', () => {
               clearTimeout(timeout);
               reject(new Error('AbortError'));
             });

             // If we want to simulate the timeout without waiting 10s we could override setTimeout
             // However, vitest useFakeTimers is not enabled here so we just rely on LLMBrain.ts's logic
             // Wait, since we are returning a slow promise, LLMBrain will wait 10s and then abort.
             // To prevent a 10s delay in the test suite, we'll manually fire the abort signal immediately from the mock.
             // Actually, since the AbortController is created inside LLMBrain.ts, we can't easily advance time unless we use vi.useFakeTimers.
          }
        });
      });

      vi.useFakeTimers();
      const originalRandom = Math.random;
      Math.random = () => 0.1; // Ensure it passes responsiveness
      try {
        const decidePromise = brain.decide(defaultMsg, defaultContext);

        // Fast-forward time to trigger the 10-second timeout inside LLMBrain.ts
        vi.advanceTimersByTime(11000);

        const result = await decidePromise;
        expect(result).toBeNull();
      } finally {
        Math.random = originalRandom;
        vi.useRealTimers();
      }
    });

    it('should inject Authorization header when apiKey is present', async () => {
       const brain = new LLMBrain("http://localhost", "secret-key-123");
       let usedHeaders: any;
       global.fetch = vi.fn().mockImplementation(async (url, init) => {
           usedHeaders = init.headers;
           return {
               ok: true,
               json: async () => ({ response: JSON.stringify({ what: 'w', where: 'w', how: 'h', reasoning: 'r' }) })
           };
       });
       const originalRandom = Math.random;
       Math.random = () => 0.1; // Ensure it passes responsiveness
       try {
           await brain.decide(defaultMsg, defaultContext);
           expect(usedHeaders).toHaveProperty('Authorization', 'Bearer secret-key-123');
       } finally {
           Math.random = originalRandom;
       }
    });
  });
});
