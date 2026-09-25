import { describe, it, expect, vi } from 'vitest';
import { Mesh } from '../../logic/Mesh';
import { Agent } from '../../logic/Agent';
import { Message, Brain, AgentContext } from '../../logic/Types';

class MockBrain implements Brain {
  async decide(message: Message, context: AgentContext): Promise<Message | null> {
    if (message.what === 'ignore') return null;
    return {
      id: `response-${crypto.randomUUID()}`,
      senderId: context.id,
      timestamp: Date.now(),
      what: 'response-what',
      where: 'response-where',
      how: 'response-how',
      reasoning: 'response-reasoning'
    };
  }
}

describe('Mesh', () => {
  it('should register agents and expose them', () => {
    const mesh = new Mesh(10);
    const agent = new Agent('agent-1', 'TestAgent', 'Tester', new MockBrain());

    mesh.registerAgent(agent);

    expect(mesh.getAgents().length).toBe(1);
    expect(mesh.getAgents()[0]).toBe(agent);
  });

  it('should not register invalid agents', () => {
    const mesh = new Mesh(10);
    mesh.registerAgent(null as any);
    mesh.registerAgent({} as any);
    expect(mesh.getAgents().length).toBe(0);
  });

  it('should broadcast message and collect responses up to message limit', async () => {
    const mesh = new Mesh(3); // Limit to 3 messages processed
    const agent = new Agent('agent-1', 'TestAgent', 'Tester', new MockBrain());
    mesh.registerAgent(agent);

    const initialMsg: Message = { id: 'msg-1', senderId: 'root', timestamp: 1, what: 'start', where: 'here', how: 'now', reasoning: 'test' };

    await mesh.broadcast(initialMsg);

    // It processes msg-1. Agent responds with response-1.
    // It processes response-1. Agent responds with response-2.
    // It processes response-2. Agent responds with response-3.
    // Limit of 3 reached, branch terminates.
    expect(mesh.getMessages().length).toBe(3);
    expect(mesh.getMessages()[0]).toBe(initialMsg);
  });

  it('should drop messages exceeding token bounds', async () => {
    const mesh = new Mesh(10);
    const agent = new Agent('agent-1', 'TestAgent', 'Tester', new MockBrain());
    mesh.registerAgent(agent);

    const oversizedWhat = 'A'.repeat(20000); // Definitely > 4000 limit

    const initialMsg: Message = { id: 'msg-1', senderId: 'root', timestamp: 1, what: oversizedWhat, where: 'here', how: 'now', reasoning: 'test' };

    await mesh.broadcast(initialMsg);

    // It will push it to mesh.messages but reject it before agent processing
    expect(mesh.getMessages().length).toBe(1);
    expect(mesh.getMessages()[0]).toBe(initialMsg);

    // Agent history should be empty as it never received it
    expect(agent.context.history.length).toBe(0);
  });

  it('should drop messages with invalid AST (e.g. empty functions)', async () => {
      const mesh = new Mesh(10);
      const agent = new Agent('agent-1', 'TestAgent', 'Tester', new MockBrain());
      mesh.registerAgent(agent);

      const initialMsg: Message = {
          id: 'msg-1',
          senderId: 'root',
          timestamp: 1,
          what: 'Implement this \n ```ts\n function doNothing() {} \n```',
          where: 'here',
          how: 'now',
          reasoning: 'test'
      };

      await mesh.broadcast(initialMsg);

      expect(mesh.getMessages().length).toBe(1);
      // Agent history should be empty
      expect(agent.context.history.length).toBe(0);
  });

  it('should gracefully handle agent exceptions during receiveMessage', async () => {
      const mesh = new Mesh(10);
      class FailingBrain implements Brain {
          async decide(): Promise<Message | null> {
              throw new Error("Brain failure");
          }
      }
      const agent = new Agent('agent-1', 'TestAgent', 'Tester', new FailingBrain());
      mesh.registerAgent(agent);

      const initialMsg: Message = { id: 'msg-1', senderId: 'root', timestamp: 1, what: 'start', where: 'here', how: 'now', reasoning: 'test' };

      // Should not throw, should log error and continue
      await mesh.broadcast(initialMsg);

      expect(mesh.getMessages().length).toBe(1);
  });
});
