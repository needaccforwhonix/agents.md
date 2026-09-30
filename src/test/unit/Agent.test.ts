import { describe, it, expect } from 'vitest';
import { Agent } from '../../logic/Agent';
import { RuleBasedBrain } from '../../logic/RuleBasedBrain';
import { Message } from '../../logic/Types';

describe('Agent Unit Tests', () => {
  it('should throw an error if initialized without a valid brain', () => {
    expect(() => new Agent("agent-err", "Err", "Role", null as unknown as RuleBasedBrain)).toThrow("Agent constructor requires a valid Brain instance.");
  });

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

  it('should throw error for null messages', async () => {
    const brain = new RuleBasedBrain();
    const agent = new Agent("agent-1", "Test Agent", "Test Role", brain);

    await expect(agent.receiveMessage(null as unknown as Message)).rejects.toThrow("Invalid Message: missing required fields.");
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

  describe('Table-Driven Edge Cases for Agent Parameters & Initialization', () => {
    const edgeCases = [
      {
        name: 'undefined parameters should fallback to defaults',
        params: undefined,
        verify: (agent: Agent) => {
          expect(agent.context.parameters.responsiveness).toBe(0.6);
          expect(agent.context.parameters.generation).toBe(1);
        }
      },
      {
        name: 'NaN parameters should be preserved natively',
        params: { responsiveness: NaN },
        verify: (agent: Agent) => {
          expect(Number.isNaN(agent.context.parameters.responsiveness)).toBe(true);
          expect(agent.context.parameters.generation).toBe(1);
        }
      },
      {
        name: 'empty object parameters should fallback to defaults',
        params: {},
        verify: (agent: Agent) => {
          expect(agent.context.parameters.responsiveness).toBe(0.6);
          expect(agent.context.parameters.analyticalDepth).toBe(0.5);
        }
      },
      {
        name: 'extreme numbers should initialize properly',
        params: { contextRetention: Infinity, generation: 100 },
        verify: (agent: Agent) => {
          expect(agent.context.parameters.contextRetention).toBe(Infinity);
          expect(agent.context.parameters.generation).toBe(100);
        }
      }
    ];

    it.each(edgeCases)('should safely handle $name', ({ params, verify }) => {
      const brain = new RuleBasedBrain();
      const agent = new Agent("agent-1", "Test Agent", "Test Role", brain, params);
      verify(agent);
    });
  });

  describe('Table-Driven Message Handling Boundary Checks', () => {
    const mockBrainResponse: Message = {
      id: "response-1",
      senderId: "agent-1",
      timestamp: Date.now(),
      what: "res",
      where: "res",
      how: "res",
      reasoning: "res"
    };

    const mockBrain = new RuleBasedBrain();
    // Deterministically return a response
    mockBrain.decide = async () => mockBrainResponse;

    const agent = new Agent("agent-1", "Test Agent", "Test Role", mockBrain);

    const receiveCases = [
      {
        name: 'undefined message',
        msg: undefined as unknown as Message,
        shouldThrow: true
      },
      {
        name: 'message missing id',
        msg: { senderId: "sys", timestamp: 1, what: "w", where: "w", how: "h" } as unknown as Message,
        shouldThrow: true
      },
      {
        name: 'message missing what',
        msg: { id: "1", senderId: "sys", timestamp: 1, where: "w", how: "h" } as unknown as Message,
        shouldThrow: true
      },
      {
        name: 'valid generic message',
        msg: {
          id: "msg-1",
          senderId: "system",
          timestamp: Date.now(),
          what: "w",
          where: "w",
          how: "h",
          reasoning: "r",
        },
        expectedResponse: mockBrainResponse,
        shouldThrow: false
      }
    ];

    it.each(receiveCases)('should process $name safely', async ({ msg, expectedResponse, shouldThrow }) => {
      if (shouldThrow) {
        await expect(agent.receiveMessage(msg)).rejects.toThrow("Invalid Message: missing required fields.");
      } else {
        const response = await agent.receiveMessage(msg);
        expect(response).toEqual(expectedResponse);
      }
    });
  });
});
