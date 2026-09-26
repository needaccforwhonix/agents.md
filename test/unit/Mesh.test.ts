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

    mesh.registerAgent(null as unknown as Agent);
    expect(mesh.getAgents().length).toBe(0);


    mesh.registerAgent({} as Agent);
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

    await mesh.broadcast(null as unknown as Message);
    expect(mesh.getMessages().length).toBe(0);


    await mesh.broadcast(undefined as unknown as Message);
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

  it('should drop messages that exceed token limits in various fields', async () => {
    const mesh = new Mesh(10);
    const brain = new RuleBasedBrain();
    const agent1 = new Agent("agent-1", "Agent 1", "Role", brain, { responsiveness: 1.0 });
    mesh.registerAgent(agent1);

    const oversizedWhat: Message = {
      id: "oversized-what", senderId: "system", timestamp: Date.now(),
      what: "a".repeat(20000), where: "where", how: "how", reasoning: "reasoning",
    };
    await mesh.broadcast(oversizedWhat);

    const oversizedWhere: Message = {
      id: "oversized-where", senderId: "system", timestamp: Date.now(),
      what: "what", where: "a".repeat(20000), how: "how", reasoning: "reasoning",
    };
    await mesh.broadcast(oversizedWhere);

    const oversizedHow: Message = {
      id: "oversized-how", senderId: "system", timestamp: Date.now(),
      what: "what", where: "where", how: "a".repeat(20000), reasoning: "reasoning",
    };
    await mesh.broadcast(oversizedHow);

    const oversizedReasoning: Message = {
      id: "oversized-reasoning", senderId: "system", timestamp: Date.now(),
      what: "what", where: "where", how: "how", reasoning: "a".repeat(20000),
    };
    await mesh.broadcast(oversizedReasoning);

    // The initial messages are pushed to this.messages before validation.
    expect(mesh.getMessages().length).toBe(4);
    expect(mesh.getMessages()[0].id).toBe("oversized-what");
    expect(mesh.getMessages()[1].id).toBe("oversized-where");
    expect(mesh.getMessages()[2].id).toBe("oversized-how");
    expect(mesh.getMessages()[3].id).toBe("oversized-reasoning");
  });

  it('should gracefully handle empty or undefined broadcasts', async () => {
    const mesh = new Mesh(10);
    // Passing undefined directly to test the initial boundary defensive check
    await mesh.broadcast(undefined as unknown as Message);

    expect(mesh.getMessages().length).toBe(0);
  });

  it('should continue loop gracefully if an undefined message is shifted from the queue', async () => {
    const mesh = new Mesh(10);

    const initialMessage: Message = {
      id: "msg-initial",
      senderId: "system",
      timestamp: Date.now(),
      what: "what",
      where: "where",
      how: "how",
      reasoning: "reasoning"
    };

    // We can spy on Array.prototype.shift to inject an undefined message into the loop
    // just once to trigger the `if (!message) continue;` line
    const originalShift = Array.prototype.shift;
    let shiftCalled = 0;
    Array.prototype.shift = function() {
      shiftCalled++;
      if (shiftCalled === 2) {
        // Mock a sparse array returning undefined even if length > 0
        return undefined;
      }
      return originalShift.apply(this);
    };

    try {
      // We need at least one valid message to enter the loop, then we inject undefined
      // on the second iteration.
      // To make sure there is a second iteration, we need an agent to respond to the first message.
      const brain = new RuleBasedBrain();
      const agent = new Agent("agent-1", "Test", "Role", brain, { responsiveness: 1.0 });
      mesh.registerAgent(agent);

      await mesh.broadcast(initialMessage);
    } finally {
      Array.prototype.shift = originalShift;
    }

    // As long as it didn't throw an error, the line was successfully triggered and passed.
    expect(mesh.getMessages().length).toBeGreaterThan(0);
  });

  it('should skip processing if analyzeCodeBlock fails in the loop', async () => {
    const mesh = new Mesh(10);
    const brain = new RuleBasedBrain();
    const agent1 = new Agent("agent-1", "Agent 1", "Role", brain, { responsiveness: 1.0 });
    mesh.registerAgent(agent1);

    // Create a message with multiple code blocks where one is invalid.
    const invalidMessage: Message = {
      id: "invalid-code-blocks",
      senderId: "system",
      timestamp: Date.now(),
      what: "what",
      where: "where",
      how: "how \n```ts\nconst x = 1;\n```\n ```ts\nlet y: any;\n```",
      reasoning: "reasoning",
    };

    await mesh.broadcast(invalidMessage);

    // Should push to messages, but agent won't respond because validation fails on the 'any' keyword
    expect(mesh.getMessages().length).toBe(1);
    expect(mesh.getMessages()[0].id).toBe("invalid-code-blocks");
  });

  it('should handle errors thrown by agents during message receiving', async () => {
    const mesh = new Mesh(10);
    const mockBrain = {
      decide: async () => { throw new Error("Agent explosion"); }
    };
    const agent = new Agent("agent-err", "ErrAgent", "Role", mockBrain as any);
    mesh.registerAgent(agent);

    const initialMessage: Message = {
      id: "msg-initial",
      senderId: "system",
      timestamp: Date.now(),
      what: "what",
      where: "where",
      how: "how",
      reasoning: "reasoning"
    };

    // Should not throw, should just log error and proceed
    await mesh.broadcast(initialMessage);
    expect(mesh.getMessages().length).toBe(1);
  });

  it('should allow setting messages directly', () => {
    const mesh = new Mesh(10);
    const messages: Message[] = [
      { id: "1", senderId: "sys", timestamp: 1, what: "w", where: "w", how: "h", reasoning: "r" }
    ];
    mesh.setMessages(messages);
    expect(mesh.getMessages()).toEqual(messages);
  });

  it('should handle messages with undefined reasoning properly', async () => {
    const mesh = new Mesh(10);
    const brain = new RuleBasedBrain();
    const agent = new Agent("agent-1", "Test", "Role", brain, { responsiveness: 0 }); // ensure it doesn't respond
    mesh.registerAgent(agent);

    const msgWithoutReasoning = {
      id: "no-reasoning-msg",
      senderId: "system",
      timestamp: Date.now(),
      what: "what",
      where: "where",
      how: "how"
    } as unknown as Message;

    await mesh.broadcast(msgWithoutReasoning);

    expect(mesh.getMessages().length).toBe(1);
    expect(mesh.getMessages()[0].id).toBe("no-reasoning-msg");
  });

});
