import { describe, it, expect } from "vitest";
import { determineRoleFromFileNode, createDynamicAgent } from "../../logic/DynamicAgentRegistry";
import { RuleBasedBrain } from "../../logic/RuleBasedBrain";

describe("DynamicAgentRegistry", () => {
  describe("determineRoleFromFileNode", () => {
    it.each([
      { isDir: true, name: "src", expected: "Directory Manager" },
      { isDir: true, name: "components", expected: "Directory Manager" },
      { isDir: false, name: "index.ts", expected: "TypeScript File Manager" },
      { isDir: false, name: "logic.ts", expected: "TypeScript File Manager" },
      { isDir: false, name: "App.tsx", expected: "React Component Manager" },
      { isDir: false, name: "Button.tsx", expected: "React Component Manager" },
      { isDir: false, name: "package.json", expected: "JSON Config Manager" },
      { isDir: false, name: "tsconfig.json", expected: "JSON Config Manager" },
      { isDir: false, name: "README.md", expected: "Markdown Documenter" },
      { isDir: false, name: "docs.md", expected: "Markdown Documenter" },
      { isDir: false, name: "styles.css", expected: "File Manager" },
      { isDir: false, name: "script.js", expected: "File Manager" },
      { isDir: false, name: "image.png", expected: "File Manager" },
      { isDir: false, name: "", expected: "File Manager" },
      { isDir: true, name: "", expected: "Directory Manager" },
    ])("should determine role correctly for isDir=$isDir, name='$name'", ({ isDir, name, expected }) => {
      const role = determineRoleFromFileNode(isDir, name);
      expect(role).toBe(expected);
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
