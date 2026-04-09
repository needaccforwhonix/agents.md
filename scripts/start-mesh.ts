import { Mesh } from "../components/AgentMesh/logic/Mesh";
import { Agent } from "../components/AgentMesh/logic/Agent";
import { RuleBasedBrain } from "../components/AgentMesh/logic/RuleBasedBrain";
import { Message } from "../components/AgentMesh/logic/Types";

async function startBackgroundMesh() {
  console.log("Initializing Agent2Agent Background Mesh...");

  const mesh = new Mesh(5000); // Higher message limit for longer simulation
  const brain = new RuleBasedBrain();

  // Increased responsiveness for background to ensure a deeper, longer-running AgentMesh simulation
  const devAgent = new Agent("bg-agent-1", "SysDevBot", "System Developer", brain, { responsiveness: 0.6 });
  const secAgent = new Agent("bg-agent-2", "SysSecBot", "System Security Analyst", brain, { responsiveness: 0.5 });
  const docAgent = new Agent("bg-agent-3", "SysDocBot", "System Documenter", brain, { responsiveness: 0.5 });
  const perfAgent = new Agent("bg-agent-4", "SysPerfBot", "System Performance Optimizer", brain, { responsiveness: 0.5 });
  const styleAgent = new Agent("bg-agent-5", "SysStyleBot", "System Style Enforcer", brain, { responsiveness: 0.5 });
  const cleanAgent = new Agent("bg-agent-6", "SysCleanBot", "System Cleanliness & Order", brain, { responsiveness: 0.5 });
  const optAgent = new Agent("bg-agent-7", "SysOptBot", "Prompt & Logic Optimizer", brain, { responsiveness: 0.6 });
  const rootAgent = new Agent("bg-agent-dir-0", "SysRootBot", "Root Directory Manager", brain, { responsiveness: 0.55 });
  const componentsAgent = new Agent("bg-agent-dir-1", "SysCompBot", "Components Manager", brain, { responsiveness: 0.5 });
  const pagesAgent = new Agent("bg-agent-dir-2", "SysPageBot", "Pages Manager", brain, { responsiveness: 0.5 });
  const scriptsAgent = new Agent("bg-agent-dir-3", "SysScriptBot", "Scripts Manager", brain, { responsiveness: 0.5 });
  const githubAgent = new Agent("bg-agent-dir-4", "SysGithubBot", "Github Config Manager", brain, { responsiveness: 0.5 });
  const publicAgent = new Agent("bg-agent-dir-5", "SysPublicBot", "Public Assets Manager", brain, { responsiveness: 0.5 });
  const stylesAgent = new Agent("bg-agent-dir-6", "SysStylesBot", "Styles Manager", brain, { responsiveness: 0.5 });
  const testAgent = new Agent("bg-agent-dir-7", "SysTestBot", "Test Directory Manager", brain, { responsiveness: 0.5 });
  const testResultsAgent = new Agent("bg-agent-dir-8", "SysTestResultsBot", "Test Results Manager", brain, { responsiveness: 0.5 });
  const testE2EAgent = new Agent("bg-agent-dir-9", "SysTestE2EBot", "Test E2E Directory Manager", brain, { responsiveness: 0.5 });
  const testUnitAgent = new Agent("bg-agent-dir-10", "SysTestUnitBot", "Test Unit Directory Manager", brain, { responsiveness: 0.5 });
  const configAgent = new Agent("bg-agent-dir-11", "SysConfigBot", "Root Config Manager", brain, { responsiveness: 0.5 });

  mesh.registerAgent(rootAgent);
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
  mesh.registerAgent(githubAgent);
  mesh.registerAgent(publicAgent);
  mesh.registerAgent(stylesAgent);
  mesh.registerAgent(testAgent);
  mesh.registerAgent(testResultsAgent);
  mesh.registerAgent(testE2EAgent);
  mesh.registerAgent(testUnitAgent);
  mesh.registerAgent(configAgent);

  const initialMessage: Message = {
    id: crypto.randomUUID(),
    senderId: "system-cron",
    timestamp: Date.now(),
    what: "Run continuous background optimization and refactoring pass. Actively propose improvements and implement robust structural changes emphasizing Sicherheit, Performance, Style, documentation, Sauberkeit, and Ordnung. Execute optimizations of logic, prompts, and implementations across the entire codebase.",
    where: "components/AgentMesh/logic, root, components, pages, scripts, public, .github, styles, test, test/e2e, test/unit, and test-results.",
    how: "Use AlphaEvolve and Agentic Context Engineering. Each agent must use its domain context to react to the incoming broadcast, ensuring explicit output defining what, where, and how improvements should be made. Integrate Demock testing, E2E/Unit testing, and AST validation. Dabei kann gerne stehts geholfen werden.",
    reasoning: "To establish a robust agent2agent structure where everything has its own agent, allowing parallel asynchronous evolution with full context to stay continuously updated and optimized.",
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
