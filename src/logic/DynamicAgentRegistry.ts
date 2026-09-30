import { Agent } from "./Agent";
import { Brain } from "./Types";

export function determineRoleFromFileNode(isDir: boolean, name: string): string {
  if (name === null || name === undefined) {
    throw new Error("name cannot be null or undefined");
  }

  if (isDir) {
    return "Directory Manager";
  }

  if (name.endsWith(".ts")) {
    return "TypeScript File Manager";
  } else if (name.endsWith(".tsx")) {
    return "React Component Manager";
  } else if (name.endsWith(".json")) {
    return "JSON Config Manager";
  } else if (name.endsWith(".md")) {
    return "Markdown Documenter";
  }

  return "File Manager";
}

export function createDynamicAgent(nodeId: string, nodePath: string, isDir: boolean, name: string, brain: Brain, responsiveness: number = 0.05): Agent {
  if (!nodeId || !nodePath || name === null || name === undefined || !brain) {
    throw new Error("Invalid parameters");
  }

  const role = determineRoleFromFileNode(isDir, name);
  return new Agent(nodeId, nodePath, role, brain, { responsiveness });
}
