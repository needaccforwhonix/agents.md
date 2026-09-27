import { describe, it, expect } from "vitest";
import { determineRoleFromFileNode, createDynamicAgent } from "../../logic/DynamicAgentRegistry";
import { RuleBasedBrain } from "../../logic/RuleBasedBrain";

describe("DynamicAgentRegistry", () => {
  describe("determineRoleFromFileNode", () => {
    it("should return 'Directory Manager' if node is a directory", () => {
      const role = determineRoleFromFileNode(true, "src");
      expect(role).toBe("Directory Manager");
    });

    it("should return 'TypeScript File Manager' for .ts files", () => {
      const role = determineRoleFromFileNode(false, "index.ts");
      expect(role).toBe("TypeScript File Manager");
    });

    it("should return 'React Component Manager' for .tsx files", () => {
      const role = determineRoleFromFileNode(false, "App.tsx");
      expect(role).toBe("React Component Manager");
    });

    it("should return 'JSON Config Manager' for .json files", () => {
      const role = determineRoleFromFileNode(false, "package.json");
      expect(role).toBe("JSON Config Manager");
    });

    it("should return 'Markdown Documenter' for .md files", () => {
      const role = determineRoleFromFileNode(false, "README.md");
      expect(role).toBe("Markdown Documenter");
    });

    it("should return 'File Manager' for other files", () => {
      const role = determineRoleFromFileNode(false, "styles.css");
      expect(role).toBe("File Manager");
    });
  });

  describe("createDynamicAgent", () => {
    it("should correctly instantiate an Agent with the determined role and responsiveness", () => {
      const brain = new RuleBasedBrain();
      const agent = createDynamicAgent("agent-id-1", "/src/index.ts", false, "index.ts", brain, 0.1);

      expect(agent.context.id).toBe("agent-id-1");
      expect(agent.context.name).toBe("/src/index.ts");
      expect(agent.context.role).toBe("TypeScript File Manager");
      expect(agent.context.parameters.responsiveness).toBe(0.1);
    });

    it("should use a default responsiveness of 0.05 if not provided", () => {
      const brain = new RuleBasedBrain();
      const agent = createDynamicAgent("agent-id-2", "/src/components", true, "components", brain);

      expect(agent.context.role).toBe("Directory Manager");
      expect(agent.context.parameters.responsiveness).toBe(0.05);
    });
  });
});
