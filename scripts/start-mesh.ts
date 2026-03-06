import { Mesh } from "../components/AgentMesh/logic/Mesh";
import { Agent } from "../components/AgentMesh/logic/Agent";
import { RuleBasedBrain } from "../components/AgentMesh/logic/RuleBasedBrain";
import { Message } from "../components/AgentMesh/logic/Types";

async function startBackgroundMesh() {
  console.log("Initializing Agent2Agent Background Mesh...");

  const mesh = new Mesh();
  const brain = new RuleBasedBrain();

  // Set lower responsiveness for background to ensure it runs longer without maxing out
  // Domains
  const securityAgent = new Agent("bg-agent-sec", "SysSecBot", "System Security Analyst", brain, { responsiveness: 0.1 });
  const performanceAgent = new Agent("bg-agent-perf", "SysPerfBot", "System Performance Analyst", brain, { responsiveness: 0.1 });
  const styleAgent = new Agent("bg-agent-style", "SysStyleBot", "System Style Analyst", brain, { responsiveness: 0.1 });
  const docAgent = new Agent("bg-agent-doc", "SysDocBot", "System Documenter", brain, { responsiveness: 0.1 });
  const cleanAgent = new Agent("bg-agent-clean", "SysCleanBot", "System Cleanliness Analyst", brain, { responsiveness: 0.1 });
  const orderAgent = new Agent("bg-agent-order", "SysOrderBot", "System Order Analyst", brain, { responsiveness: 0.1 });
  const optAgent = new Agent("bg-agent-opt", "SysOptBot", "System Optimization Analyst", brain, { responsiveness: 0.1 });

  // Directories
  const componentsAgent = new Agent("bg-agent-dir-components", "SysComponentsBot", "Components Directory Analyst", brain, { responsiveness: 0.1 });
  const pagesAgent = new Agent("bg-agent-dir-pages", "SysPagesBot", "Pages Directory Analyst", brain, { responsiveness: 0.1 });
  const scriptsAgent = new Agent("bg-agent-dir-scripts", "SysScriptsBot", "Scripts Directory Analyst", brain, { responsiveness: 0.1 });

  mesh.registerAgent(securityAgent);
  mesh.registerAgent(performanceAgent);
  mesh.registerAgent(styleAgent);
  mesh.registerAgent(docAgent);
  mesh.registerAgent(cleanAgent);
  mesh.registerAgent(orderAgent);
  mesh.registerAgent(optAgent);

  mesh.registerAgent(componentsAgent);
  mesh.registerAgent(pagesAgent);
  mesh.registerAgent(scriptsAgent);

  const initialMessage: Message = {
    id: crypto.randomUUID(),
    senderId: "system-cron",
    timestamp: Date.now(),
    what: "Run continuous background optimization and refactoring pass",
    where: "components/AgentMesh/logic",
    how: "Use AlphaEvolve and Agentic Context Engineering to propose long-term logic improvements",
    reasoning: "To keep the codebase up-to-date with security, performance, and best practices."
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
