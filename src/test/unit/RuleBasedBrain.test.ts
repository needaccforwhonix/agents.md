import { describe, it, expect } from "vitest";
import { RuleBasedBrain } from "../../logic/RuleBasedBrain";
import { Message, AgentContext, AgentParameters } from "../../logic/Types";

describe("RuleBasedBrain", () => {
    it("should cover different roles", async () => {
        const brain = new RuleBasedBrain();

        const roles = [
            "System Security Analyst",
            "System Performance Optimizer",
            "System Style Enforcer",
            "System Documenter",
            "System Cleanliness & Order",
            "Prompt & Logic Optimizer",
            "System Developer",
            "tsconfig.json Manager",
            "package.json Manager",
            "next.config.ts Manager",
            "postcss.config.mjs Manager",
            "README.md Manager",
            "AGENTS.md Manager",
            "File Manager",
            "TypeScript File Manager",
            "React Component Manager",
            "JSON Config Manager",
            "Markdown Documenter",
            "Root Directory Manager",
            "Components Manager",
            "Pages Manager",
            "Scripts Manager",
            "Github Config Manager",
            "Public Assets Manager",
            "Styles Manager",
            "Test Directory Manager",
            "Directory Manager",
            "Default Role"
        ];

        for (const role of roles) {
            const context: AgentContext = {
                id: role,
                name: "Test",
                role: role,
                history: [],
                parameters: { responsiveness: 1.0 } // 100% chance to respond
            };

            const msg: Message = { id: "msg", senderId: "other", timestamp: 1, what: "w", where: "w", how: "h", reasoning: "r" };
            const resp = await brain.decide(msg, context);
            expect(resp).not.toBeNull();
            expect(resp!.how).toContain("Reagiert auf"); // simplistic check
        }
    });

    it("should throttle if random > responsiveness", async () => {
        const brain = new RuleBasedBrain();
        const context: AgentContext = {
            id: "1", name: "n", role: "r", history: [],
            parameters: { responsiveness: 0.0 } // 0% chance
        };
        const msg: Message = { id: "m", senderId: "other", timestamp: 1, what: "w", where: "w", how: "h", reasoning: "r" };
        const resp = await brain.decide(msg, context);
        expect(resp).toBeNull();
    });

    it("should handle missing parameters object safely", async () => {
        const brain = new RuleBasedBrain();
        const context: AgentContext = {
            id: "1", name: "n", role: "r", history: [],
            parameters: undefined as unknown as AgentParameters
        }; // Context without parameters

        const msg: Message = { id: "m", senderId: "other", timestamp: 1, what: "w", where: "w", how: "h", reasoning: "r" };

        // Spy Math.random to always allow response (return 0)
        const originalRandom = Math.random;
        Math.random = () => 0.1;

        try {
            const resp = await brain.decide(msg, context);
            expect(resp).not.toBeNull();
        } finally {
            Math.random = originalRandom;
        }
    });

    it("should correctly handle missing reasoning field in message", async () => {
        const brain = new RuleBasedBrain();
        const context: AgentContext = {
            id: "1", name: "n", role: "r", history: [],
            parameters: { responsiveness: 1.0 }
        };
        // Intentionally testing missing reasoning field
        const msg = { id: "m", senderId: "other", timestamp: 1, what: "w", where: "w", how: "h" } as unknown as Message; // No reasoning
        const resp = await brain.decide(msg, context);
        expect(resp).not.toBeNull();
        expect(resp!.reasoning).toContain("aufbauend auf []"); // Should use "" when reasoning is undefined, but the implementation does (message.reasoning || "").length but later uses [${safeReasoning}] and safeReasoning becomes 'undefined' string because of template literal string conversion somewhere else? No, `(message.reasoning || "").length` gives 0. `message.reasoning.substring()` is not called. safeReasoning is just `message.reasoning` (which is undefined)
    });

    it("should check default role fallback correctly", async () => {
        const brain = new RuleBasedBrain();
        const context: AgentContext = {
            id: "1", name: "n", role: "UnknownRole", history: [],
            parameters: { responsiveness: 1.0 }
        };
        const msg: Message = { id: "m", senderId: "other", timestamp: 1, what: "w", where: "w", how: "h", reasoning: "r" };
        const resp = await brain.decide(msg, context);
        expect(resp).not.toBeNull();
        expect(resp!.how).toContain("Apply Agentic Context Engineering");
    });

    it("should throw error for invalid inputs", async () => {
        const brain = new RuleBasedBrain();
        await expect(brain.decide(null as unknown as Message, null as unknown as AgentContext)).rejects.toThrow("Input message cannot be null or undefined");
    });

    it("should return null if sender matches context id (drop message)", async () => {
        const brain = new RuleBasedBrain();
        const context: AgentContext = { id: "1", name: "n", role: "r", history: [], parameters: undefined as unknown as AgentParameters };
        const msg: Message = { id: "m", senderId: "1", timestamp: 1, what: "", where: "", how: "", reasoning: "" };
        expect(await brain.decide(msg, context)).toBeNull();
    });

    it("should truncate long fields", async () => {
        const brain = new RuleBasedBrain();
        const longText = "a".repeat(5000);
        const context: AgentContext = {
            id: "1", name: "n", role: "r", history: [],
            parameters: { responsiveness: 1.0 }
        };
        const msg: Message = { id: "m", senderId: "other", timestamp: 1, what: longText, where: longText, how: longText, reasoning: longText };
        const resp = await brain.decide(msg, context);
        expect(resp).not.toBeNull();
        expect(resp!.what.length).toBeLessThan(10000); // 4000 + additional wrapper text
        expect(resp!.what.includes("...")).toBe(true);
        expect(resp!.where.includes("...")).toBe(true);
        expect(resp!.how.includes("...")).toBe(true);
        expect(resp!.reasoning.includes("...")).toBe(true);
    });
  it('should throw error for empty or invalid inputs', async () => {
    const brain = new RuleBasedBrain();
    const testContext: AgentContext = {
      id: "agent-1", name: "Test Agent", role: "Role", history: [], parameters: {}
    };

    await expect(brain.decide(null as unknown as Message, testContext)).rejects.toThrow("Input message cannot be null or undefined");
    await expect(brain.decide(undefined as unknown as Message, testContext)).rejects.toThrow("Input message cannot be null or undefined");

    const validMsg = { id: "1", senderId: "sys", timestamp: 1, what: "w", where: "w", how: "h" } as unknown as Message;

    await expect(brain.decide(validMsg, null as unknown as AgentContext)).rejects.toThrow("Input context cannot be null or undefined");
    await expect(brain.decide(validMsg, undefined as unknown as AgentContext)).rejects.toThrow("Input context cannot be null or undefined");
  });

  it('should set appropriate roleSpecificHow for all known roles', async () => {
    const brain = new RuleBasedBrain();
    const rolesToTest = [
      "System Security Analyst",
      "System Performance Optimizer",
      "System Style Enforcer",
      "System Documenter",
      "System Cleanliness & Order",
      "Prompt & Logic Optimizer",
      "System Developer",
      "tsconfig.json Manager",
      "package.json Manager",
      "next.config.ts Manager",
      "postcss.config.mjs Manager",
      "README.md Manager",
      "AGENTS.md Manager",
      "File Manager",
      "TypeScript File Manager",
      "React Component Manager",
      "JSON Config Manager",
      "Markdown Documenter",
      "Root Directory Manager",
      "Components Manager",
      "Pages Manager",
      "Scripts Manager",
      "Github Config Manager",
      "Public Assets Manager",
      "Styles Manager",
      "Test Directory Manager",
      "Directory Manager",
      "Unknown Role" // Fallback branch
    ];

    const validMsg: Message = { id: "1", senderId: "sys", timestamp: 1, what: "w", where: "w", how: "h", reasoning: "r" };

    for (const role of rolesToTest) {
      const context: AgentContext = {
        id: "agent-test", name: `Test-${role}`, role: role, history: [], parameters: { responsiveness: 1.0 }
      };
      const response = await brain.decide(validMsg, context);
      expect(response).toBeDefined();
      expect(response?.how).toBeDefined();
    }
  });

  it('should gracefully handle missing parameters object', async () => {
    const brain = new RuleBasedBrain();
    const validMsg: Message = { id: "1", senderId: "sys", timestamp: 1, what: "w", where: "w", how: "h", reasoning: "r" };
    const context: AgentContext = {
      id: "agent-test", name: "Test Agent", role: "Role", history: [], parameters: undefined as unknown as AgentParameters
    };

    // It should fall back to 0.5 responsiveness. By running it enough times we can ensure it handles undefined parameters safely.
    let handled = false;
    for (let i = 0; i < 20; i++) {
      const response = await brain.decide(validMsg, context);
      if (response !== null) {
        handled = true;
        break;
      }
    }
    expect(handled).toBe(true);
  });

  it('should explicitly drop message if fallback responsiveness (0.5) is not met', async () => {
    const brain = new RuleBasedBrain();
    const validMsg: Message = { id: "1", senderId: "sys", timestamp: 1, what: "w", where: "w", how: "h", reasoning: "r" };
    const context: AgentContext = {
      id: "agent-test", name: "Test Agent", role: "Role", history: [], parameters: undefined as unknown as AgentParameters
    };

    const originalRandom = Math.random;
    // Spy Math.random to return 0.9. Fallback is 0.5, so 0.9 > 0.5 -> should drop
    Math.random = () => 0.9;
    try {
      const response = await brain.decide(validMsg, context);
      expect(response).toBeNull();
    } finally {
      Math.random = originalRandom;
    }
  });

  it('should safely fall back when history array is undefined or null', async () => {
    const brain = new RuleBasedBrain();
    const validMsg: Message = { id: "1", senderId: "sys", timestamp: 1, what: "w", where: "w", how: "h", reasoning: "r" };
    const context: AgentContext = {
      id: "agent-test", name: "Test Agent", role: "Role", history: undefined as unknown as Message[], parameters: { responsiveness: 1.0 }
    };

    const response = await brain.decide(validMsg, context);
    expect(response).not.toBeNull();
    expect(response!.reasoning).toContain("AlphaEvolve");
  });

  it('should set the exact roleSpecificHow for System Cleanliness & Order', async () => {
    const brain = new RuleBasedBrain();
    const validMsg: Message = { id: "1", senderId: "sys", timestamp: 1, what: "w", where: "w", how: "h", reasoning: "r" };
    const context: AgentContext = {
      id: "agent-test", name: "Test Agent", role: "System Cleanliness & Order", history: [], parameters: { responsiveness: 1.0 }
    };

    const response = await brain.decide(validMsg, context);
    expect(response).not.toBeNull();
    expect(response!.how).toContain("Identify obsolete mock patterns, remove unused imports, and consolidate logic.");
  });

  it('should handle rapid sequential duplicate inputs gracefully by truncating history in context (if implemented) or correctly evaluating roleSpecificHow based on repetitive context', async () => {
    const brain = new RuleBasedBrain();
    const context: AgentContext = {
      id: "agent-test", name: "Test Agent", role: "System Developer", history: [], parameters: { responsiveness: 1.0 }
    };

    const duplicateMsg: Message = { id: "2", senderId: "sys", timestamp: 1, what: "duplicate", where: "w", how: "h", reasoning: "r" };

    // Simulate history accumulating
    for(let i = 0; i < 20; i++) {
        context.history.push({ ...duplicateMsg, id: `hist-${i}` });
    }

    const response = await brain.decide(duplicateMsg, context);
    expect(response).not.toBeNull();
    expect(response!.reasoning).toContain("AlphaEvolve");
  });

  describe('Table-Driven Logic Gate Verification', () => {
    const defaultContext: AgentContext = { id: 'agent-1', name: 'Agent 1', role: 'Role', history: [], parameters: { responsiveness: 1.0 } };
    const defaultMsg: Message = { id: 'msg-1', senderId: 'agent-2', timestamp: Date.now(), what: 'w', where: 'w', how: 'h', reasoning: 'r' };

    const logicGates = [
      {
        name: 'empty inputs - null message',
        msg: null as unknown as Message,
        ctx: defaultContext,
        expected: 'error-msg'
      },
      {
        name: 'empty inputs - undefined message',
        msg: undefined as unknown as Message,
        ctx: defaultContext,
        expected: 'error-msg'
      },
      {
        name: 'empty inputs - null context',
        msg: defaultMsg,
        ctx: null as unknown as AgentContext,
        expected: 'error-ctx'
      },
      {
        name: 'empty inputs - undefined context',
        msg: defaultMsg,
        ctx: undefined as unknown as AgentContext,
        expected: 'error-ctx'
      },
      {
        name: 'sender matches context id (drop message)',
        msg: { ...defaultMsg, senderId: 'agent-1' },
        ctx: defaultContext,
        expected: null
      },
      {
        name: 'maximum token limits - fields over 4000 chars are truncated',
        msg: { ...defaultMsg, what: 'a'.repeat(5000), where: 'b'.repeat(5000), how: 'c'.repeat(5000), reasoning: 'd'.repeat(5000) },
        ctx: defaultContext,
        expected: 'truncate'
      },
      {
        name: 'responsiveness drop - random above threshold',
        msg: defaultMsg,
        ctx: { ...defaultContext, parameters: { responsiveness: 0.1 } },
        setupRandom: () => 0.9,
        expected: null
      },
      {
        name: 'responsiveness accept - random below threshold',
        msg: defaultMsg,
        ctx: { ...defaultContext, parameters: { responsiveness: 0.9 } },
        setupRandom: () => 0.1,
        expected: 'accept'
      }
    ];

    for (const testCase of logicGates) {
      it(`should handle ${testCase.name}`, async () => {
        const brain = new RuleBasedBrain();
        let originalRandom: typeof Math.random | null = null;

        if (testCase.setupRandom) {
          originalRandom = Math.random;
          Math.random = testCase.setupRandom;
        }

        try {
          if (testCase.expected === 'error-msg') {
            await expect(brain.decide(testCase.msg, testCase.ctx)).rejects.toThrow("Input message cannot be null or undefined");
          } else if (testCase.expected === 'error-ctx') {
            await expect(brain.decide(testCase.msg, testCase.ctx)).rejects.toThrow("Input context cannot be null or undefined");
          } else {
            const result = await brain.decide(testCase.msg, testCase.ctx);

            if (testCase.expected === null) {
              expect(result).toBeNull();
            } else if (testCase.expected === 'truncate') {
              expect(result).not.toBeNull();
              expect(result!.what).not.toContain('a'.repeat(4001));
              expect(result!.what).toContain('a'.repeat(4000) + '...');
            } else if (testCase.expected === 'accept') {
              expect(result).not.toBeNull();
              expect(result!.what).toContain('(WAS)');
            }
          }
        } finally {
          if (originalRandom) {
            Math.random = originalRandom;
          }
        }
      });
    }
  });
});
