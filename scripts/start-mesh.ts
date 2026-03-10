import { Mesh } from "../components/AgentMesh/logic/Mesh";
import { Agent } from "../components/AgentMesh/logic/Agent";
import { RuleBasedBrain } from "../components/AgentMesh/logic/RuleBasedBrain";
import { Message } from "../components/AgentMesh/logic/Types";

async function startBackgroundMesh() {
  console.log("Initializing Agent2Agent Background Mesh...");

  const mesh = new Mesh();
  const brain = new RuleBasedBrain();

  // Directory Agents
  const componentsAgent = new Agent("bg-dir-components", "ComponentsBot", "Components Directory Manager", brain, { responsiveness: 0.2 });
  const pagesAgent = new Agent("bg-dir-pages", "PagesBot", "Pages Directory Manager", brain, { responsiveness: 0.2 });
  const scriptsAgent = new Agent("bg-dir-scripts", "ScriptsBot", "Scripts Directory Manager", brain, { responsiveness: 0.2 });

  // Domain Agents
  const securityAgent = new Agent("bg-dom-security", "SecurityBot", "Security Specialist", brain, { responsiveness: 0.1 });
  const performanceAgent = new Agent("bg-dom-performance", "PerformanceBot", "Performance Optimizer", brain, { responsiveness: 0.1 });
  const styleAgent = new Agent("bg-dom-style", "StyleBot", "Style and UI Expert", brain, { responsiveness: 0.1 });
  const documentationAgent = new Agent("bg-dom-docs", "DocsBot", "Documentation Maintainer", brain, { responsiveness: 0.1 });
  const cleanlinessAgent = new Agent("bg-dom-cleanliness", "CleanBot", "Code Cleanliness Enforcer", brain, { responsiveness: 0.1 });
  const orderAgent = new Agent("bg-dom-order", "OrderBot", "Architecture and Order Overseer", brain, { responsiveness: 0.1 });
  const optimizationAgent = new Agent("bg-dom-opt", "OptimizationBot", "Prompt and Process Optimizer", brain, { responsiveness: 0.1 });

  const allAgents = [
    componentsAgent, pagesAgent, scriptsAgent,
    securityAgent, performanceAgent, styleAgent, documentationAgent, cleanlinessAgent, orderAgent, optimizationAgent
  ];
  allAgents.forEach(agent => mesh.registerAgent(agent));

  const initialMessage: Message = {
    id: crypto.randomUUID(),
    senderId: "system-cron",
    timestamp: Date.now(),
    what: "Run continuous background optimization and refactoring pass",
    where: "components/AgentMesh/logic",
    how: "Use AlphaEvolve and Agentic Context Engineering to propose long-term logic improvements",
    reasoning: "To continuously improve system performance, code cleanliness, and security asynchronously",
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
