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

  // Domain Agents
  const secAgent = new Agent("bg-agent-sec", "SysSecBot", "Security Analyst", brain, { responsiveness: 0.1 });
  const perfAgent = new Agent("bg-agent-perf", "SysPerfBot", "Performance Optimizer", brain, { responsiveness: 0.1 });
  const styleAgent = new Agent("bg-agent-style", "SysStyleBot", "Style Enforcer", brain, { responsiveness: 0.1 });
  const docAgent = new Agent("bg-agent-doc", "SysDocBot", "Documentation Manager", brain, { responsiveness: 0.1 });
  const cleanAgent = new Agent("bg-agent-clean", "SysCleanBot", "Cleanliness Manager", brain, { responsiveness: 0.1 });
  const orderAgent = new Agent("bg-agent-order", "SysOrderBot", "Order Manager", brain, { responsiveness: 0.1 });
  const optAgent = new Agent("bg-agent-opt", "SysOptBot", "Optimization Manager", brain, { responsiveness: 0.1 });

  // Directory Agents
  const rootAgent = new Agent("bg-agent-dir-root", "SysRootBot", "Root Directory Manager", brain, { responsiveness: 0.1 });
  const componentsAgent = new Agent("bg-agent-dir-comp", "SysCompBot", "Components Directory Manager", brain, { responsiveness: 0.1 });
  const pagesAgent = new Agent("bg-agent-dir-page", "SysPageBot", "Pages Directory Manager", brain, { responsiveness: 0.1 });
  const scriptsAgent = new Agent("bg-agent-dir-script", "SysScriptBot", "Scripts Directory Manager", brain, { responsiveness: 0.1 });
  const testAgent = new Agent("bg-agent-dir-test", "SysTestBot", "Test Directory Manager", brain, { responsiveness: 0.1 });
  const stylesAgent = new Agent("bg-agent-dir-styles", "SysStylesBot", "Styles Directory Manager", brain, { responsiveness: 0.1 });
  const publicAgent = new Agent("bg-agent-dir-public", "SysPublicBot", "Public Directory Manager", brain, { responsiveness: 0.1 });
  const githubAgent = new Agent("bg-agent-dir-github", "SysGithubBot", "Github Directory Manager", brain, { responsiveness: 0.1 });

  mesh.registerAgent(devAgent);

  mesh.registerAgent(secAgent);
  mesh.registerAgent(perfAgent);
  mesh.registerAgent(styleAgent);
  mesh.registerAgent(docAgent);
  mesh.registerAgent(cleanAgent);
  mesh.registerAgent(orderAgent);
  mesh.registerAgent(optAgent);

  mesh.registerAgent(rootAgent);
  mesh.registerAgent(componentsAgent);
  mesh.registerAgent(pagesAgent);
  mesh.registerAgent(scriptsAgent);
  mesh.registerAgent(testAgent);
  mesh.registerAgent(stylesAgent);
  mesh.registerAgent(publicAgent);
  mesh.registerAgent(githubAgent);

  const initialMessage: Message = {
    id: crypto.randomUUID(),
    senderId: "system-cron",
    timestamp: Date.now(),
    what: "Run continuous background optimization and refactoring pass",
    where: "components/AgentMesh/logic",
    how: "Use AlphaEvolve and Agentic Context Engineering to propose long-term logic improvements",
    reasoning: "To keep everything continuing to evolve asynchronously and stay up-to-date with security, performance, style, documentation, cleanliness, and order.",
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
