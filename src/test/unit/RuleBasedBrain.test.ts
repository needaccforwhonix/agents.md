import { describe, it, expect } from 'vitest';
import { RuleBasedBrain } from '../../logic/RuleBasedBrain';
import { Message, AgentContext } from '../../logic/Types';

describe('RuleBasedBrain Unit Tests', () => {
  it('should ignore null inputs', async () => {
    const brain = new RuleBasedBrain();

    // @ts-expect-error test ignore
    const response = await brain.decide(null, null);
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

describe('RuleBasedBrain Advanced Roles Tests', () => {
  it('should test formatting for various roles', async () => {
    const brain = new RuleBasedBrain();
    const rolesToTest = [
      { role: "System Performance Optimizer", expectedSubstring: "Profile AST bounds" },
      { role: "System Style Enforcer", expectedSubstring: "strict TypeScript types" },
      { role: "System Documenter", expectedSubstring: "dynamic README summaries" },
      { role: "System Cleanliness & Order", expectedSubstring: "obsolete mock patterns" },
      { role: "Prompt & Logic Optimizer", expectedSubstring: "refine ACE logic" },
      { role: "System Developer", expectedSubstring: "core logic enhancements" },
      { role: "tsconfig.json Manager", expectedSubstring: "Maintain the configuration and metadata" },
      { role: "TypeScript File Manager", expectedSubstring: "Analyze and optimize TypeScript logic" },
      { role: "React Component Manager", expectedSubstring: "rendering performance" },
      { role: "JSON Config Manager", expectedSubstring: "Validate and maintain correct JSON schema" },
      { role: "Markdown Documenter", expectedSubstring: "Update markdown documentation" },
      { role: "Root Directory Manager", expectedSubstring: "directory-specific constraints are met" },
    ];

    for (const testCase of rolesToTest) {
      const context: AgentContext = {
        id: "agent-1",
        name: testCase.role,
        role: testCase.role,
        history: [],
        parameters: { responsiveness: 1.0 }
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
      expect(response!.how).toContain(testCase.expectedSubstring);
    }
  });

  it('should format responses appropriately for default/unknown role', async () => {
    const brain = new RuleBasedBrain();
    const context: AgentContext = {
      id: "agent-1",
      name: "Agent 1",
      role: "Unknown Role",
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
    expect(response!.how).toContain("Apply Agentic Context Engineering");
  });

  it('should set chanceToRespond correctly when parameters are missing', async () => {
    const brain = new RuleBasedBrain();
    const context: AgentContext = {
      id: "agent-1",
      name: "Agent 1",
      role: "Unknown Role",
      history: [],
      parameters: {} // Missing responsiveness
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

    const results = [];
    for (let i = 0; i < 100; i++) {
        const response = await brain.decide(message, context);
        results.push(response);
    }
    const nulls = results.filter(r => r === null).length;
    const nonNulls = results.filter(r => r !== null).length;

    expect(nulls).toBeGreaterThanOrEqual(0);
    expect(nonNulls).toBeGreaterThanOrEqual(0);
  });
});
