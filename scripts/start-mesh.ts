import { Mesh } from "../components/AgentMesh/logic/Mesh";
import { Agent } from "../components/AgentMesh/logic/Agent";
import { RuleBasedBrain } from "../components/AgentMesh/logic/RuleBasedBrain";
import { Message } from "../components/AgentMesh/logic/Types";
import * as fs from "fs";
import * as path from "path";

async function startBackgroundMesh() {
  console.log("Initializing Agent2Agent Background Mesh...");

  const mesh = new Mesh();
  const brain = new RuleBasedBrain();

  // 1. Create specialized domain agents
  const domainRoles = [
    { id: "domain-sec", name: "SecAgent", role: "Security Optimizer", responsiveness: 0.3 },
    { id: "domain-perf", name: "PerfAgent", role: "Performance Optimizer", responsiveness: 0.3 },
    { id: "domain-style", name: "StyleAgent", role: "Style and Lint Enforcer", responsiveness: 0.2 },
    { id: "domain-doc", name: "DocAgent", role: "Documentation Specialist", responsiveness: 0.2 },
    { id: "domain-clean", name: "CleanAgent", role: "Cleanliness and Order Enforcer", responsiveness: 0.2 },
    { id: "domain-opt", name: "PromptOptAgent", role: "Prompt and Implementation Optimizer", responsiveness: 0.3 },
  ];

  for (const roleDef of domainRoles) {
    mesh.registerAgent(new Agent(roleDef.id, roleDef.name, roleDef.role, brain, { responsiveness: roleDef.responsiveness }));
  }

  // 2. Create directory-specific agents ("everything gets its own a2a agent")
  const rootDir = path.resolve(__dirname, "..");
  const mainDirs = ["components", "pages", "scripts", "styles", "public"];

  for (const dirName of mainDirs) {
    const dirPath = path.join(rootDir, dirName);
    if (fs.existsSync(dirPath)) {
      mesh.registerAgent(new Agent(`dir-${dirName}`, `${dirName}DirAgent`, `Directory Guardian for ${dirName}`, brain, { responsiveness: 0.1 }));
    }
  }

  const initialMessage: Message = {
    id: crypto.randomUUID(),
    senderId: "system-cron",
    timestamp: Date.now(),
    what: "Run continuous background optimization and refactoring pass",
    where: "Entire Codebase",
    how: "Use AlphaEvolve and Agentic Context Engineering to propose long-term logic improvements across all directories",
    reasoning: "To keep the project constantly optimized in terms of security, performance, style, documentation, cleanliness, order, and prompt effectiveness."
  };

  console.log("Broadcasting initial task to mesh...");
  await mesh.broadcast(initialMessage);

  console.log("Background Mesh Run Complete.");

  // Dump basic metrics
  console.log(`Total messages processed: ${mesh.getMessages().length}`);
  mesh.getAgents().forEach(agent => {
    console.log(`Agent ${agent.context.name} generation: ${agent.context.parameters.generation}`);
  });
}

startBackgroundMesh().catch(err => {
  console.error("Background Mesh Error:", err);
  process.exit(1);
});
