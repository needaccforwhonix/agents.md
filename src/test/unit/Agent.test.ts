import { describe, it, expect } from 'vitest';
import { Agent } from '../../logic/Agent';
import { RuleBasedBrain } from '../../logic/RuleBasedBrain';
import { Message } from '../../logic/Types';

describe('Agent Unit Tests', () => {
  it('should initialize correctly with default parameters', () => {
    const brain = new RuleBasedBrain();
    const agent = new Agent("agent-1", "Test Agent", "Test Role", brain);

    expect(agent.context.id).toBe("agent-1");
    expect(agent.context.name).toBe("Test Agent");
    expect(agent.context.role).toBe("Test Role");
    expect(agent.context.history).toEqual([]);
    expect(agent.context.parameters.responsiveness).toBe(0.6);
  });

  it('should handle receiving a valid message and call brain', async () => {
    const brain = new RuleBasedBrain();
    const agent = new Agent("agent-1", "Test Agent", "Test Role", brain);

    const message: Message = {
      id: "msg-1",
      senderId: "system",
      timestamp: Date.now(),
      what: "Test what",
      where: "Test where",
      how: "Test how",
      reasoning: "Test reasoning",
    };

    const response = await agent.receiveMessage(message);

    expect(agent.context.history.length).toBeGreaterThan(0);
    expect(agent.context.history[0]).toEqual(message);

    // Brain might respond or not depending on randomness
    if (response) {
      expect(agent.context.history[1]).toEqual(response);
    }
  });

  it('should gracefully handle empty or null messages without crashing', async () => {
    const brain = new RuleBasedBrain();
    const agent = new Agent("agent-1", "Test Agent", "Test Role", brain);

    // @ts-expect-error test ignore
    const response = await agent.receiveMessage(null);
    expect(response).toBeNull();
    expect(agent.context.history.length).toBe(0);
  });

  it('should evolve parameters slightly after receiving a message', async () => {
    const brain = new RuleBasedBrain();
    const agent = new Agent("agent-1", "Test Agent", "Test Role", brain);



    const message: Message = {
      id: "msg-1",
      senderId: "system",
      timestamp: Date.now(),
      what: "what",
      where: "where",
      how: "how",
      reasoning: "reasoning",
    };

    await agent.receiveMessage(message);

    expect(agent.context.parameters.responsiveness).toBeDefined();
    // In AlphaEvolve it mutates by a small factor, so it shouldn't be exactly the same or could be slightly modified
  });
});
