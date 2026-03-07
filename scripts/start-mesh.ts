import { Mesh } from "../components/AgentMesh/logic/Mesh";
import { Agent } from "../components/AgentMesh/logic/Agent";
import { RuleBasedBrain } from "../components/AgentMesh/logic/RuleBasedBrain";
import { Message } from "../components/AgentMesh/logic/Types";

async function startBackgroundMesh() {
  console.log("Initializing Agent2Agent Background Mesh...");

  const mesh = new Mesh();
  const brain = new RuleBasedBrain();

  // Set higher responsiveness for background to ensure it runs longer
  const devAgent = new Agent("bg-agent-1", "SysDevBot", "Logic Developer", brain, { responsiveness: 0.8 });
  const secAgent = new Agent("bg-agent-2", "SysSecBot", "Security Analyst", brain, { responsiveness: 0.7 });
  const perfAgent = new Agent("bg-agent-3", "SysPerfBot", "Performance Engineer", brain, { responsiveness: 0.7 });
  const styleAgent = new Agent("bg-agent-4", "SysStyleBot", "Style & UI Designer", brain, { responsiveness: 0.7 });
  const docAgent = new Agent("bg-agent-5", "SysDocBot", "Documentation Specialist", brain, { responsiveness: 0.7 });
  const cleanAgent = new Agent("bg-agent-6", "SysCleanBot", "Cleanliness & Order Inspector", brain, { responsiveness: 0.7 });
  const optAgent = new Agent("bg-agent-7", "SysOptBot", "Prompt Optimization Engineer", brain, { responsiveness: 0.7 });

  mesh.registerAgent(devAgent);
  mesh.registerAgent(secAgent);
  mesh.registerAgent(perfAgent);
  mesh.registerAgent(styleAgent);
  mesh.registerAgent(docAgent);
  mesh.registerAgent(cleanAgent);
  mesh.registerAgent(optAgent);

  const initialMessage: Message = {
    id: crypto.randomUUID(),
    senderId: "system-cron",
    timestamp: Date.now(),
    what: "Run continuous background optimization and refactoring pass",
    where: "components/AgentMesh",
    how: "Use AlphaEvolve and Agentic Context Engineering to propose long-term improvements",
    why: "To proactively enhance code quality, performance, style, and logic robustness across the mesh.",
  };

  console.log("Broadcasting initial task to mesh...");
  await mesh.broadcast(initialMessage);

  console.log("Background Mesh Run Complete.");

  // Dump basic metrics
  const messages = mesh.getMessages();
  console.log(`Total messages processed: ${messages.length}`);

  if (messages.length > 0) {
    const lastMsg = messages[messages.length - 1];
    console.log(`\nSample Latest Message Output:
Sender: ${lastMsg.senderId}
What: ${lastMsg.what}
Where: ${lastMsg.where}
How: ${lastMsg.how}
Why: ${lastMsg.why}\n`);
  }

  mesh.getAgents().forEach(agent => {
    console.log(`Agent ${agent.context.name} generation: ${agent.context.parameters.generation}`);
  });
}

startBackgroundMesh().catch(err => {
  console.error("Background Mesh Error:", err);
  process.exit(1);
});
