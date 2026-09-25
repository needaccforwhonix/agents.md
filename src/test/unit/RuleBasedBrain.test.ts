import { describe, it, expect } from "vitest";
import { RuleBasedBrain } from "../../logic/RuleBasedBrain";
import { Message, AgentContext } from "../../logic/Types";

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
            "TypeScript File Manager",
            "React Component Manager",
            "JSON Config Manager",
            "Markdown Documenter",
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
});
