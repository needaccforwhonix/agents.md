import { describe, it, expect } from 'vitest';
import { RuleBasedBrain } from '../../src/logic/RuleBasedBrain';
import { Message, AgentContext } from '../../src/logic/Types';

describe('RuleBasedBrain Unit Tests', () => {
  it('should ignore null inputs', async () => {
    const brain = new RuleBasedBrain();

    // @ts-ignore
    let response = await brain.decide(null, null);
    expect(response).toBeNull();
  });

  it('should ignore messages sent by the agent itself', async () => {
    const brain = new RuleBasedBrain();
    const context: AgentContext = {
      id: "agent-1",
      name: "Agent 1",
      role: "System Developer",
      history: [],
      parameters: { responsiveness: 1.0 }
    };

    const message: Message = {
      id: "msg-1",
      senderId: "agent-1",
      timestamp: Date.now(),
      what: "what",
      where: "where",
      how: "how",
      reasoning: "reasoning",
    };

    const response = await brain.decide(message, context);
    expect(response).toBeNull();
  });

  it('should format responses appropriately based on roles', async () => {
    const brain = new RuleBasedBrain();
    const context: AgentContext = {
      id: "agent-1",
      name: "Agent 1",
      role: "System Security Analyst",
      history: [],
      parameters: { responsiveness: 1.0 } // Guarantee response
    };

    const message: Message = {
      id: "msg-1",
      senderId: "system",
      timestamp: Date.now(),
      what: "what",
      where: "where",
      how: "how",
      reasoning: "reasoning",
    };

    const response = await brain.decide(message, context);
    expect(response).not.toBeNull();
    expect(response!.how).toContain("vulnerability scanning");
  });

  it('should throttle appropriately based on responsiveness', async () => {
    const brain = new RuleBasedBrain();
    const context: AgentContext = {
      id: "agent-1",
      name: "Agent 1",
      role: "System Developer",
      history: [],
      parameters: { responsiveness: 0.0 } // Guarantee NO response
    };

    const message: Message = {
      id: "msg-1",
      senderId: "system",
      timestamp: Date.now(),
      what: "what",
      where: "where",
      how: "how",
      reasoning: "reasoning",
    };

    const response = await brain.decide(message, context);
    expect(response).toBeNull();
  });

  it('should gracefully handle huge texts and truncate them securely', async () => {
    const brain = new RuleBasedBrain();
    const context: AgentContext = {
      id: "agent-1",
      name: "Agent 1",
      role: "System Developer",
      history: [],
      parameters: { responsiveness: 1.0 }
    };

    const hugeText = "a".repeat(5000);
    const message: Message = {
      id: "msg-1",
      senderId: "system",
      timestamp: Date.now(),
      what: hugeText,
      where: "where",
      how: "how",
      reasoning: "reasoning",
    };

    const response = await brain.decide(message, context);
    expect(response).not.toBeNull();
    // Verify truncation in output message logic (substring 4000)
    // The constructed string wraps it, but the injected portion should not exceed 4000 + few chars ('...')
    const extractedWhat = response!.what.match(/\[(.*?)\]/)?.[1] || "";
    expect(extractedWhat.length).toBeLessThanOrEqual(4005);
  });
});
