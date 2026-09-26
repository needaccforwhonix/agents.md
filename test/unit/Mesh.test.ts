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

  it('should reject messages with invalid Demock patterns based on AST Demock validation', async () => {
    const mesh = new Mesh(10);
    const brain = new RuleBasedBrain();
    const agent1 = new Agent("agent-1", "Agent 1", "Role", brain, { responsiveness: 1.0 });
    mesh.registerAgent(agent1);

    const invalidMessage: Message = {
      id: "demock-invalid-msg",
      senderId: "system",
      timestamp: Date.now(),
      what: "what",
      where: "where",
      how: "how ```typescript\nconst dummy = 'mock_data';\n```",
      reasoning: "reasoning",
    };

    await mesh.broadcast(invalidMessage);

    // The initial message is pushed to this.messages before validation.
    // However, validation fails because of 'dummy' / 'mock_' patterns.
    // Therefore, it is not sent to agents.
    expect(mesh.getMessages().length).toBe(1);
    expect(mesh.getMessages()[0].id).toBe("demock-invalid-msg");
  });

  it('should drop messages that exceed token limits', async () => {
    const mesh = new Mesh(10);
    const brain = new RuleBasedBrain();
    const agent1 = new Agent("agent-1", "Agent 1", "Role", brain, { responsiveness: 1.0 });
    mesh.registerAgent(agent1);

    const oversizedMessage: Message = {
      id: "oversized-msg",
      senderId: "system",
      timestamp: Date.now(),
      what: "a".repeat(20000), // Exceeds typical token limits by far
      where: "where",
      how: "how",
      reasoning: "reasoning",
    };

    await mesh.broadcast(oversizedMessage);

    // The initial message is pushed to this.messages before validation.
    // However, validation fails, so it is not sent to agents.
    // Therefore, there should be no responses from agents, and length remains 1.
    expect(mesh.getMessages().length).toBe(1);
    expect(mesh.getMessages()[0].id).toBe("oversized-msg");
  });

  it('should handle errors thrown by agents during message receiving', async () => {
    const mesh = new Mesh(10);
    const mockBrain = {
      decide: async () => { throw new Error("Agent explosion"); }
    };
    // @ts-ignore
    const agent = new Agent("agent-err", "ErrAgent", "Role", mockBrain);
    mesh.registerAgent(agent);

    const initialMessage: Message = {
      id: "msg-initial",
      senderId: "system",
      timestamp: Date.now(),
      what: "what",
      where: "where",
      how: "how"
    };

    // Should not throw, should just log error and proceed
    await mesh.broadcast(initialMessage);
    expect(mesh.getMessages().length).toBe(1);
  });

  it('should allow setting messages directly', () => {
    const mesh = new Mesh(10);
    const messages: Message[] = [
      { id: "1", senderId: "sys", timestamp: 1, what: "w", where: "w", how: "h" }
    ];
    mesh.setMessages(messages);
    expect(mesh.getMessages()).toEqual(messages);
  });
});
