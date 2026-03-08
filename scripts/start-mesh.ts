import { Mesh } from "../components/AgentMesh/logic/Mesh";
import { Agent } from "../components/AgentMesh/logic/Agent";
import { RuleBasedBrain } from "../components/AgentMesh/logic/RuleBasedBrain";
import { Message } from "../components/AgentMesh/logic/Types";

async function startBackgroundMesh() {
  console.log("Initializing Agent2Agent Background Mesh...");

  const mesh = new Mesh();
  const brain = new RuleBasedBrain();

  // Set lower responsiveness for background to ensure it runs longer without maxing out

  // Directory Agents
  const componentsAgent = new Agent("dir-components", "ComponentsBot", "Components Manager", brain, { responsiveness: 0.1 });
  const pagesAgent = new Agent("dir-pages", "PagesBot", "Pages Manager", brain, { responsiveness: 0.1 });
  const scriptsAgent = new Agent("dir-scripts", "ScriptsBot", "Scripts Manager", brain, { responsiveness: 0.1 });

  // Domain Agents
  const secAgent = new Agent("dom-security", "SecurityBot", "Security Specialist", brain, { responsiveness: 0.1 });
  const perfAgent = new Agent("dom-performance", "PerformanceBot", "Performance Specialist", brain, { responsiveness: 0.1 });
  const styleAgent = new Agent("dom-style", "StyleBot", "Style Specialist", brain, { responsiveness: 0.1 });
  const docAgent = new Agent("dom-documentation", "DocBot", "Documentation Specialist", brain, { responsiveness: 0.1 });
  const cleanAgent = new Agent("dom-cleanliness", "CleanBot", "Cleanliness Specialist", brain, { responsiveness: 0.1 });
  const orderAgent = new Agent("dom-order", "OrderBot", "Order Specialist", brain, { responsiveness: 0.1 });
  const optAgent = new Agent("dom-optimization", "OptimizeBot", "Optimization Specialist", brain, { responsiveness: 0.1 });

  mesh.registerAgent(componentsAgent);
  mesh.registerAgent(pagesAgent);
  mesh.registerAgent(scriptsAgent);
  mesh.registerAgent(secAgent);
  mesh.registerAgent(perfAgent);
  mesh.registerAgent(styleAgent);
  mesh.registerAgent(docAgent);
  mesh.registerAgent(cleanAgent);
  mesh.registerAgent(orderAgent);
  mesh.registerAgent(optAgent);

  const initialMessage: Message = {
    id: crypto.randomUUID(),
    senderId: "system-cron",
    timestamp: Date.now(),
    what: "Run continuous background optimization and refactoring pass",
    where: "components/AgentMesh/logic",
    how: "Use AlphaEvolve and Agentic Context Engineering to propose long-term logic improvements",
    reasoning: "To continuously improve system performance, security, and cleanliness as per user directives.",
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
