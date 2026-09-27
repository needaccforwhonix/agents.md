import { describe, it, expect } from "vitest";
import { determineRoleFromFileNode, createDynamicAgent } from "../../logic/DynamicAgentRegistry";
import { RuleBasedBrain } from "../../logic/RuleBasedBrain";

describe("DynamicAgentRegistry", () => {
  describe("determineRoleFromFileNode", () => {
    it("should return 'Directory Manager' if isDir is true", () => {
      expect(determineRoleFromFileNode(true, "some_dir")).toBe("Directory Manager");
    });

    it("should return 'TypeScript File Manager' for .ts files", () => {
      expect(determineRoleFromFileNode(false, "index.ts")).toBe("TypeScript File Manager");
    });

    it("should return 'React Component Manager' for .tsx files", () => {
      expect(determineRoleFromFileNode(false, "App.tsx")).toBe("React Component Manager");
    });

    it("should return 'JSON Config Manager' for .json files", () => {
      expect(determineRoleFromFileNode(false, "package.json")).toBe("JSON Config Manager");
    });

    it("should return 'Markdown Documenter' for .md files", () => {
      expect(determineRoleFromFileNode(false, "README.md")).toBe("Markdown Documenter");
    });

    it("should return 'File Manager' for other file types", () => {
      expect(determineRoleFromFileNode(false, "image.png")).toBe("File Manager");
      expect(determineRoleFromFileNode(false, "styles.css")).toBe("File Manager");
      expect(determineRoleFromFileNode(false, "index.js")).toBe("File Manager");
    });
  });

  describe("createDynamicAgent", () => {
    it("should create an Agent with the correct role and parameters", () => {
      const brain = new RuleBasedBrain();
      const agent = createDynamicAgent("agent-1", "/src/index.ts", false, "index.ts", brain, 0.1);

      expect(agent.context.id).toBe("agent-1");
      expect(agent.context.name).toBe("/src/index.ts");
      expect(agent.context.role).toBe("TypeScript File Manager");
      expect(agent.context.parameters.responsiveness).toBe(0.1);
    });

    it("should use default responsiveness of 0.05 if not provided", () => {
      const brain = new RuleBasedBrain();
      const agent = createDynamicAgent("agent-2", "/src", true, "src", brain);
      expect(agent.context.role).toBe("Directory Manager");
      expect(agent.context.parameters.responsiveness).toBe(0.05);
    });
  });
});
