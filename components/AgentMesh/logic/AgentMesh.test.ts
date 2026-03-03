import { describe, it, expect, vi } from 'vitest';
import { AgentMesh } from './AgentMesh';
import { Agent } from './Agent';
import { Brain, Message, Context, AgentConfig } from './types';

class MockBrain implements Brain {
  process(message: Message, context: Context, config: AgentConfig): Message | null {
    if (message.how === 'test-no-response') return null;
    return {
      id: 'msg-' + Math.random(),
      senderId: 'mock-agent',
      timestamp: Date.now(),
      what: 'Mock response',
      where: 'test',
      how: 'test-response'
    };
  }
}

describe('AgentMesh Logic', () => {
  it('registers and unregisters agents', () => {
    const mesh = new AgentMesh();
    const agent = new Agent('mock-agent', new MockBrain(), { temperature: 0, mutationRate: 0, maxMemoryTokens: 100 });

    mesh.register(agent);
    expect(mesh.getAgents().length).toBe(1);

    mesh.unregister('mock-agent');
    expect(mesh.getAgents().length).toBe(0);
  });

  it('broadcasts messages to agents', async () => {
    vi.useFakeTimers();

    const mesh = new AgentMesh();
    const agent = new Agent('mock-agent', new MockBrain(), { temperature: 0, mutationRate: 0, maxMemoryTokens: 100 });
    mesh.register(agent);

    const initialMsg: Message = {
      id: 'init-msg',
      senderId: 'User',
      timestamp: Date.now(),
      what: 'Test broadcast',
      where: 'test',
      how: 'test-no-response' // stops infinite recursion
    };

    mesh.broadcast(initialMsg);

    // Allow async broadcasts to clear
    await vi.runAllTimersAsync();

    const history = mesh.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].what).toBe('Test broadcast');

    vi.useRealTimers();
  });
});
