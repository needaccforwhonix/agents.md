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
  const componentsAgent = new Agent("bg-dir-components", "ComponentsDirBot", "Components Directory Manager", brain, { responsiveness: 0.05 });
  const pagesAgent = new Agent("bg-dir-pages", "PagesDirBot", "Pages Directory Manager", brain, { responsiveness: 0.05 });
  const scriptsAgent = new Agent("bg-dir-scripts", "ScriptsDirBot", "Scripts Directory Manager", brain, { responsiveness: 0.05 });

  // Domain Agents
  const securityAgent = new Agent("bg-dom-security", "SecBot", "Security Specialist", brain, { responsiveness: 0.05 });
  const performanceAgent = new Agent("bg-dom-perf", "PerfBot", "Performance Optimizer", brain, { responsiveness: 0.05 });
  const styleAgent = new Agent("bg-dom-style", "StyleBot", "Style & UI/UX Expert", brain, { responsiveness: 0.05 });
  const documentationAgent = new Agent("bg-dom-docs", "DocBot", "Documentation Manager", brain, { responsiveness: 0.05 });
  const cleanlinessAgent = new Agent("bg-dom-clean", "CleanBot", "Code Cleanliness Specialist", brain, { responsiveness: 0.05 });
  const orderAgent = new Agent("bg-dom-order", "OrderBot", "Architecture & Order Specialist", brain, { responsiveness: 0.05 });
  const optimizationAgent = new Agent("bg-dom-opt", "OptBot", "General Optimization Specialist", brain, { responsiveness: 0.05 });
  const promptAgent = new Agent("bg-dom-prompt", "PromptBot", "Prompt Engineer & Improver", brain, { responsiveness: 0.05 });

  mesh.registerAgent(componentsAgent);
  mesh.registerAgent(pagesAgent);
  mesh.registerAgent(scriptsAgent);
  mesh.registerAgent(securityAgent);
  mesh.registerAgent(performanceAgent);
  mesh.registerAgent(styleAgent);
  mesh.registerAgent(documentationAgent);
  mesh.registerAgent(cleanlinessAgent);
  mesh.registerAgent(orderAgent);
  mesh.registerAgent(optimizationAgent);
  mesh.registerAgent(promptAgent);

  const initialMessage: Message = {
    id: crypto.randomUUID(),
    senderId: "system-cron",
    timestamp: Date.now(),
    what: "Run continuous background optimization and refactoring pass",
    where: "Project-wide (components, pages, scripts, etc.)",
    how: "Use AlphaEvolve and Agentic Context Engineering to propose long-term improvements",
    reasoning: "To continuously ensure security, performance, style, documentation, cleanliness, order, and overall prompt optimization.",
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
