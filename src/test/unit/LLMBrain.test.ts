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
});
