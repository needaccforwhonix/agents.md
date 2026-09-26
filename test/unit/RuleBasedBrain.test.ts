import { describe, it, expect } from "vitest";
import { RuleBasedBrain } from "../../src/logic/RuleBasedBrain";
import { Message, AgentContext } from "../../src/logic/Types";

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
            // @ts-expect-error Intentionally omitting parameters to test safe handling
            parameters: undefined
        }; // Context without parameters

        const msg: Message = { id: "m", senderId: "other", timestamp: 1, what: "w", where: "w", how: "h", reasoning: "r" };

        // Mock Math.random to always allow response (return 0)
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
        const msg: Message = { id: "m", senderId: "other", timestamp: 1, what: "w", where: "w", how: "h" }; // No reasoning
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

    it("should return null for invalid inputs", async () => {
        const brain = new RuleBasedBrain();
        // @ts-expect-error Testing invalid inputs
        expect(await brain.decide(null, null)).toBeNull();
    });

    it("should return null if sender is self", async () => {
        const brain = new RuleBasedBrain();
        const context: AgentContext = { id: "1", name: "n", role: "r", history: [], parameters: {} };
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
    });
  it('should gracefully handle empty or invalid inputs', async () => {
    const brain = new RuleBasedBrain();
    const mockContext: AgentContext = {
      id: "agent-1", name: "Test Agent", role: "Role", history: [], parameters: {}
    };


    let response = await brain.decide(null, mockContext);
    expect(response).toBeNull();


    response = await brain.decide(undefined, mockContext);
    expect(response).toBeNull();

    const validMsg = { id: "1", senderId: "sys", timestamp: 1, what: "w", where: "w", how: "h" } as Message;

    response = await brain.decide(validMsg, null);
    expect(response).toBeNull();
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
      id: "agent-test", name: "Test Agent", role: "Role", history: [], parameters: undefined as any
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
});
