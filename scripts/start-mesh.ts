import { Mesh } from "../components/AgentMesh/logic/Mesh";
import { Agent } from "../components/AgentMesh/logic/Agent";
import { RuleBasedBrain } from "../components/AgentMesh/logic/RuleBasedBrain";
import { Message } from "../components/AgentMesh/logic/Types";

async function startBackgroundMesh() {
  console.log("Initializing Agent2Agent Background Mesh...");

  const mesh = new Mesh();
  const brain = new RuleBasedBrain();

  // Set lower responsiveness for background to ensure it runs longer without maxing out
  // Create an agent for every domain/directory as requested
  const devAgent = new Agent("bg-agent-dev", "SysDevBot", "System Developer", brain, { responsiveness: 0.05 });

  // Specific domains
  const secAgent = new Agent("bg-agent-sec", "SysSecBot", "System Security Analyst", brain, { responsiveness: 0.05 });
  const perfAgent = new Agent("bg-agent-perf", "SysPerfBot", "Performance Optimizer", brain, { responsiveness: 0.05 });
  const styleAgent = new Agent("bg-agent-style", "SysStyleBot", "Style & Design Lead", brain, { responsiveness: 0.05 });
  const docAgent = new Agent("bg-agent-doc", "SysDocBot", "System Documenter", brain, { responsiveness: 0.05 });
  const cleanAgent = new Agent("bg-agent-clean", "SysCleanBot", "Code Cleanliness & Order Expert", brain, { responsiveness: 0.05 });
  const orderAgent = new Agent("bg-agent-order", "SysOrderBot", "Architecture Order Lead", brain, { responsiveness: 0.05 });
  const promptAgent = new Agent("bg-agent-prompt", "SysPromptBot", "Prompt Optimization Expert", brain, { responsiveness: 0.05 });

  // Directories
  const compAgent = new Agent("bg-agent-comp", "DirComponentsBot", "Components Directory Manager", brain, { responsiveness: 0.05 });
  const pagesAgent = new Agent("bg-agent-pages", "DirPagesBot", "Pages Directory Manager", brain, { responsiveness: 0.05 });
  const scriptsAgent = new Agent("bg-agent-scripts", "DirScriptsBot", "Scripts Directory Manager", brain, { responsiveness: 0.05 });
  const stylesDirAgent = new Agent("bg-agent-styles-dir", "DirStylesBot", "Styles Directory Manager", brain, { responsiveness: 0.05 });

  mesh.registerAgent(devAgent);
  mesh.registerAgent(secAgent);
  mesh.registerAgent(perfAgent);
  mesh.registerAgent(styleAgent);
  mesh.registerAgent(docAgent);
  mesh.registerAgent(cleanAgent);
  mesh.registerAgent(orderAgent);
  mesh.registerAgent(promptAgent);
  mesh.registerAgent(compAgent);
  mesh.registerAgent(pagesAgent);
  mesh.registerAgent(scriptsAgent);
  mesh.registerAgent(stylesDirAgent);

  const initialMessage: Message = {
    id: crypto.randomUUID(),
    senderId: "system-cron",
    timestamp: Date.now(),
    what: "Run continuous background optimization and refactoring pass across all domains and directories",
    where: "entire codebase (components, pages, scripts, styles, etc.)",
    how: "Use AlphaEvolve and Agentic Context Engineering to propose long-term logic improvements",
    reasoning: "To asynchronously and continuously evolve the system, optimizing for security, performance, style, documentation, cleanliness, order, and prompt improvements.",
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
