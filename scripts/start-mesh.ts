import { Mesh } from "../components/AgentMesh/logic/Mesh";
import { Agent } from "../components/AgentMesh/logic/Agent";
import { RuleBasedBrain } from "../components/AgentMesh/logic/RuleBasedBrain";
import { Message } from "../components/AgentMesh/logic/Types";

async function startBackgroundMesh() {
  console.log("Initializing Agent2Agent Background Mesh...");

  const mesh = new Mesh(500);
  const brain = new RuleBasedBrain();

  // Set lower responsiveness for background to ensure it runs longer without maxing out
  const devAgent = new Agent("bg-agent-1", "SysDevBot", "System Developer", brain, { responsiveness: 0.2 });
  const secAgent = new Agent("bg-agent-2", "SysSecBot", "System Security Analyst", brain, { responsiveness: 0.1 });
  const docAgent = new Agent("bg-agent-3", "SysDocBot", "System Documenter", brain, { responsiveness: 0.1 });
  const perfAgent = new Agent("bg-agent-4", "SysPerfBot", "System Performance Optimizer", brain, { responsiveness: 0.1 });
  const styleAgent = new Agent("bg-agent-5", "SysStyleBot", "System Style Enforcer", brain, { responsiveness: 0.1 });
  const cleanAgent = new Agent("bg-agent-6", "SysCleanBot", "System Cleanliness & Order", brain, { responsiveness: 0.1 });
  const optAgent = new Agent("bg-agent-7", "SysOptBot", "Prompt & Logic Optimizer", brain, { responsiveness: 0.1 });

  // Directory specific agents
  const componentsAgent = new Agent("bg-agent-dir-1", "SysCompBot", "Components Manager", brain, { responsiveness: 0.1 });
  const pagesAgent = new Agent("bg-agent-dir-2", "SysPageBot", "Pages Manager", brain, { responsiveness: 0.1 });
  const scriptsAgent = new Agent("bg-agent-dir-3", "SysScriptBot", "Scripts Manager", brain, { responsiveness: 0.1 });
  const testAgent = new Agent("bg-agent-dir-4", "SysTestDirBot", "Test Manager", brain, { responsiveness: 0.1 });
  const stylesAgent = new Agent("bg-agent-dir-5", "SysStyleDirBot", "Styles Manager", brain, { responsiveness: 0.1 });
  const publicAgent = new Agent("bg-agent-dir-6", "SysPublicDirBot", "Public Manager", brain, { responsiveness: 0.1 });
  const githubAgent = new Agent("bg-agent-dir-7", "SysGithubDirBot", "Github Config Manager", brain, { responsiveness: 0.1 });
  const rootAgent = new Agent("bg-agent-dir-8", "SysRootDirBot", "Root Files Manager", brain, { responsiveness: 0.1 });

  mesh.registerAgent(devAgent);
  mesh.registerAgent(secAgent);
  mesh.registerAgent(docAgent);
  mesh.registerAgent(perfAgent);
  mesh.registerAgent(styleAgent);
  mesh.registerAgent(cleanAgent);
  mesh.registerAgent(optAgent);

  mesh.registerAgent(componentsAgent);
  mesh.registerAgent(pagesAgent);
  mesh.registerAgent(scriptsAgent);
  mesh.registerAgent(testAgent);
  mesh.registerAgent(stylesAgent);
  mesh.registerAgent(publicAgent);
  mesh.registerAgent(githubAgent);
  mesh.registerAgent(rootAgent);

  const initialMessage: Message = {
    id: crypto.randomUUID(),
    senderId: "system-cron",
    timestamp: Date.now(),
    what: "Run a deep, continuous asynchronous parallel optimization pass across all components, directories, and agents.",
    where: "entire codebase including root, test, styles, public, and .github directories.",
    how: "Use full context Agentic Context Engineering and AlphaEvolve to analyze and propose non-destructive additive refactorings and prompt/logic implementation optimization.",
    reasoning: "To ensure everything continuously evolves and stays perfectly up to date in regards to security, performance, style, documentation, cleanliness, order, and prompt optimization.",
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
