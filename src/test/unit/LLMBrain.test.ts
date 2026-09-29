import { describe, it, expect, vi } from 'vitest';
import { LLMBrain } from '../../logic/LLMBrain';
import { AgentContext, Message } from '../../logic/Types';

describe('LLMBrain', () => {
  it('should return null if message or context is undefined', async () => {
    const brain = new LLMBrain();
    const result = await brain.decide(null as unknown as Message, {} as AgentContext);
    expect(result).toBeNull();
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
        expected: null
      },
      {
        name: 'empty inputs - undefined message',
        msg: undefined as unknown as Message,
        ctx: defaultContext,
        expected: null
      },
      {
        name: 'empty inputs - null context',
        msg: defaultMsg,
        ctx: null as unknown as AgentContext,
        expected: null
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
      });
    }
  });
});
