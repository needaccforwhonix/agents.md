import { describe, it, expect } from 'vitest';
import { Mesh } from '../../src/logic/Mesh';
import { Agent } from '../../src/logic/Agent';
import { RuleBasedBrain } from '../../src/logic/RuleBasedBrain';
import { Message } from '../../src/logic/Types';

describe('Mesh Unit Tests', () => {
  it('should register an agent correctly', () => {
    const mesh = new Mesh(100);
    const brain = new RuleBasedBrain();
    const agent = new Agent("agent-1", "Test", "Role", brain);

    mesh.registerAgent(agent);
    expect(mesh.getAgents().length).toBe(1);
    expect(mesh.getAgents()[0].context.id).toBe("agent-1");
  });

  it('should silently ignore registering invalid agents', () => {
    const mesh = new Mesh(100);
    // @ts-ignore
    mesh.registerAgent(null);
    expect(mesh.getAgents().length).toBe(0);

    // @ts-ignore
    mesh.registerAgent({});
    expect(mesh.getAgents().length).toBe(0);
  });

  it('should broadcast message and correctly throttle processing via messageLimit', async () => {
    const mesh = new Mesh(2); // Very low limit to test throttle
    const brain = new RuleBasedBrain();
    // Agent with high responsiveness to guarantee reaction
    const agent1 = new Agent("agent-1", "Agent 1", "Role", brain, { responsiveness: 1.0 });
    const agent2 = new Agent("agent-2", "Agent 2", "Role", brain, { responsiveness: 1.0 });

    mesh.registerAgent(agent1);
    mesh.registerAgent(agent2);

    const initialMessage: Message = {
      id: "msg-initial",
      senderId: "system",
      timestamp: Date.now(),
      what: "what",
      where: "where",
      how: "how",
      reasoning: "reasoning",
    };

    await mesh.broadcast(initialMessage);

    // Initial message is processed + agents create responses, which adds to queue.
    // The limit of 2 should bound the processed messages to 2.
    const messages = mesh.getMessages();
    expect(messages.length).toBeLessThanOrEqual(2);
  });

  it('should gracefully handle empty or null broadcast', async () => {
    const mesh = new Mesh(10);
    // @ts-ignore
    await mesh.broadcast(null);
    expect(mesh.getMessages().length).toBe(0);
  });
});
