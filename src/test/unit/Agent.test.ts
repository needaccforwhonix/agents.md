import { describe, it, expect, vi } from 'vitest';
import { Agent } from '../../logic/Agent';
import { Message, Brain, AgentContext } from '../../logic/Types';

class MockBrain implements Brain {
  async decide(message: Message, context: AgentContext): Promise<Message | null> {
    if (message.what === 'ignore') return null;
    return {
      id: 'response-id',
      senderId: context.id,
      timestamp: 1234,
      what: 'response-what',
      where: 'response-where',
      how: 'response-how',
      reasoning: 'response-reasoning'
    };
  }
}

describe('Agent', () => {
  it('should initialize with given parameters', () => {
    const brain = new MockBrain();
    const agent = new Agent('agent-1', 'TestAgent', 'Tester', brain, { responsiveness: 0.9, customParam: 42 });

    expect(agent.context.id).toBe('agent-1');
    expect(agent.context.name).toBe('TestAgent');
    expect(agent.context.role).toBe('Tester');
    expect(agent.context.parameters.responsiveness).toBe(0.9);
    expect(agent.context.parameters.customParam).toBe(42);
    expect(agent.context.history).toEqual([]);
  });

  it('should update context history and evolve parameters when receiving a message', async () => {
    const brain = new MockBrain();
    const agent = new Agent('agent-1', 'TestAgent', 'Tester', brain, { generation: 1 });

    const initialParams = { ...agent.context.parameters };
    const msg: Message = { id: 'msg-1', senderId: 's1', timestamp: 1, what: 'A', where: 'B', how: 'C', reasoning: 'D' };

    const response = await agent.receiveMessage(msg);

    // Evolve parameter 'generation' should have incremented
    expect(agent.context.parameters.generation).toBeGreaterThan(initialParams.generation!);

    // History should contain the incoming message and the response
    expect(agent.context.history.length).toBe(2);
    expect(agent.context.history[0]).toEqual(msg);
    expect(agent.context.history[1]).toEqual(response);

    expect(response?.what).toBe('response-what');
  });

  it('should handle null response from brain', async () => {
    const brain = new MockBrain();
    const agent = new Agent('agent-1', 'TestAgent', 'Tester', brain);

    const msg: Message = { id: 'msg-1', senderId: 's1', timestamp: 1, what: 'ignore', where: 'B', how: 'C', reasoning: 'D' };

    const response = await agent.receiveMessage(msg);

    expect(response).toBeNull();
    // History should only contain the incoming message
    expect(agent.context.history.length).toBe(1);
    expect(agent.context.history[0]).toEqual(msg);
  });

  it('should handle falsy message', async () => {
      const brain = new MockBrain();
      const agent = new Agent('agent-1', 'TestAgent', 'Tester', brain);

      const response = await agent.receiveMessage(null as any);
      expect(response).toBeNull();
      expect(agent.context.history.length).toBe(0);
  });
});
