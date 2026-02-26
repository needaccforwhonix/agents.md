import { describe, it, expect, vi } from 'vitest';
import { Agent } from '../Agent';
import { RuleBasedBrain } from '../RuleBasedBrain';

describe('Agent', () => {
  it('should initialize with default params', () => {
    const agent = new Agent('test-id', 'Test Agent');
    expect(agent.state.id).toBe('test-id');
    expect(agent.state.name).toBe('Test Agent');
    expect(agent.state.context.maxTokens).toBe(4096);
  });

  it('should receive messages and update history', async () => {
    // Mock brain to prevent random response
    const mockBrain = new RuleBasedBrain();
    vi.spyOn(mockBrain, 'shouldRespond').mockReturnValue(false);

    const agent = new Agent('test-id', 'Test Agent', mockBrain);
    const message = {
      id: 'msg-1',
      senderId: 'other-id',
      senderName: 'Other Agent',
      content: 'Hello world',
      timestamp: Date.now(),
      topics: ['structure']
    };

    await agent.receive(message);

    // Now history should only contain the input message
    expect(agent.state.history).toHaveLength(1);
    expect(agent.state.history[0]).toEqual(message);
    expect(agent.state.context.tokenUsage).toBeGreaterThan(0);
  });

  it('should respond based on brain decision', async () => {
    const brain = new RuleBasedBrain();
    vi.spyOn(brain, 'shouldRespond').mockReturnValue(true);
    vi.spyOn(brain, 'process').mockResolvedValue({
        id: 'resp-1',
        senderId: 'test-id',
        senderName: 'Test Agent',
        content: 'Response',
        timestamp: Date.now(),
        topics: ['response']
    });

    const agent = new Agent('test-id', 'Test Agent', brain);
    const message = {
      id: 'msg-1',
      senderId: 'other-id',
      senderName: 'Other Agent',
      content: 'Hello',
      timestamp: Date.now(),
      topics: ['structure']
    };

    const response = await agent.receive(message);
    expect(response).not.toBeNull();
    expect(response?.content).toBe('Response');
  });
});
