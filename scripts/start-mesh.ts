import fs from "fs";
import path from "path";
import { Mesh } from "../components/AgentMesh/logic/Mesh";
import { Agent } from "../components/AgentMesh/logic/Agent";
import { RuleBasedBrain } from "../components/AgentMesh/logic/RuleBasedBrain";
import { Message } from "../components/AgentMesh/logic/Types";

function registerDynamicAgents(dir: string, mesh: Mesh, brain: RuleBasedBrain) {
  const ignored = new Set(["node_modules", ".git", ".next", "test-results", "public", ".github", "pnpm-lock.yaml"]);
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (ignored.has(file)) continue;

    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      const agent = new Agent(`dir-${fullPath}`, fullPath, "Directory Manager", brain, { responsiveness: 0.05 });
      mesh.registerAgent(agent);
      registerDynamicAgents(fullPath, mesh, brain);
    } else {
      const agent = new Agent(`file-${fullPath}`, fullPath, "File Manager", brain, { responsiveness: 0.05 });
      mesh.registerAgent(agent);
    }
  }
}

async function startBackgroundMesh() {
  console.log("Initializing Agent2Agent Background Mesh...");

  const mesh = new Mesh(10000); // Higher message limit for longer simulation
  const brain = new RuleBasedBrain();

  // Increased responsiveness for background to ensure a deeper, longer-running AgentMesh simulation
  const devAgent = new Agent("bg-agent-1", "SysDevBot", "System Developer", brain, { responsiveness: 0.05 });
  const secAgent = new Agent("bg-agent-2", "SysSecBot", "System Security Analyst", brain, { responsiveness: 0.05 });
  const docAgent = new Agent("bg-agent-3", "SysDocBot", "System Documenter", brain, { responsiveness: 0.05 });
  const perfAgent = new Agent("bg-agent-4", "SysPerfBot", "System Performance Optimizer", brain, { responsiveness: 0.05 });
  const styleAgent = new Agent("bg-agent-5", "SysStyleBot", "System Style Enforcer", brain, { responsiveness: 0.05 });
  const cleanAgent = new Agent("bg-agent-6", "SysCleanBot", "System Cleanliness & Order", brain, { responsiveness: 0.05 });
  const optAgent = new Agent("bg-agent-7", "SysOptBot", "Prompt & Logic Optimizer", brain, { responsiveness: 0.05 });
  const rootAgent = new Agent("bg-agent-dir-0", "SysRootBot", "Root Directory Manager", brain, { responsiveness: 0.05 });
  const componentsAgent = new Agent("bg-agent-dir-1", "SysCompBot", "Components Manager", brain, { responsiveness: 0.05 });
  const pagesAgent = new Agent("bg-agent-dir-2", "SysPageBot", "Pages Manager", brain, { responsiveness: 0.05 });
  const scriptsAgent = new Agent("bg-agent-dir-3", "SysScriptBot", "Scripts Manager", brain, { responsiveness: 0.05 });
  const githubAgent = new Agent("bg-agent-dir-4", "SysGithubBot", "Github Config Manager", brain, { responsiveness: 0.05 });
  const publicAgent = new Agent("bg-agent-dir-5", "SysPublicBot", "Public Assets Manager", brain, { responsiveness: 0.05 });
  const stylesAgent = new Agent("bg-agent-dir-6", "SysStylesBot", "Styles Manager", brain, { responsiveness: 0.05 });
  const testAgent = new Agent("bg-agent-dir-7", "SysTestBot", "Test Directory Manager", brain, { responsiveness: 0.05 });
  const testResultsAgent = new Agent("bg-agent-dir-8", "SysTestResultsBot", "Test Results Manager", brain, { responsiveness: 0.05 });
  const testE2EAgent = new Agent("bg-agent-dir-9", "SysTestE2EBot", "Test E2E Directory Manager", brain, { responsiveness: 0.05 });
  const testUnitAgent = new Agent("bg-agent-dir-10", "SysTestUnitBot", "Test Unit Directory Manager", brain, { responsiveness: 0.05 });
  const configAgent = new Agent("bg-agent-dir-11", "SysConfigBot", "Root Config Manager", brain, { responsiveness: 0.05 });

  const tsconfigAgent = new Agent("bg-agent-file-1", "SysTsConfigBot", "tsconfig.json Manager", brain, { responsiveness: 0.05 });
  const packagejsonAgent = new Agent("bg-agent-file-2", "SysPackageJsonBot", "package.json Manager", brain, { responsiveness: 0.05 });
  const nextconfigAgent = new Agent("bg-agent-file-3", "SysNextConfigBot", "next.config.ts Manager", brain, { responsiveness: 0.05 });
  const postcssconfigAgent = new Agent("bg-agent-file-4", "SysPostCssConfigBot", "postcss.config.mjs Manager", brain, { responsiveness: 0.05 });
  const readmeAgent = new Agent("bg-agent-file-5", "SysReadmeBot", "README.md Manager", brain, { responsiveness: 0.05 });
  const agentsmdAgent = new Agent("bg-agent-file-6", "SysAgentsMdBot", "AGENTS.md Manager", brain, { responsiveness: 0.05 });

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
  mesh.registerAgent(tsconfigAgent);
  mesh.registerAgent(packagejsonAgent);
  mesh.registerAgent(nextconfigAgent);
  mesh.registerAgent(postcssconfigAgent);
  mesh.registerAgent(readmeAgent);
  mesh.registerAgent(agentsmdAgent);

  console.log("Registering dynamic agents for all files and directories...");
  registerDynamicAgents(process.cwd(), mesh, brain);

  const initialMessage: Message = {
    id: crypto.randomUUID(),
    senderId: "system-cron",
    timestamp: Date.now(),
    what: "Run continuous background optimization and refactoring pass. Actively propose improvements and implement robust structural changes emphasizing Sicherheit, Performance, Style, documentation, Sauberkeit, and Ordnung. Execute optimizations of logic, prompts, and implementations across the entire codebase. Input und Output müssen eindeutig beschreiben was wo wie gewollt ist.",
    where: "All dynamically registered files and directories, ensuring every component of the system is actively optimized. So soll asynchron parallel alles weiter entwickelt werden und aktuell bleiben.",
    how: "Use AlphaEvolve and Agentic Context Engineering. Each agent (system, file, and directory) must use its specific context to react to the incoming broadcast, ensuring explicit output defining what, where, and how improvements should be made. Integrate Demock testing, E2E/Unit testing, and AST validation. Dabei kann gerne steht's geholfen werden. Optimierung dieser prompt und deren Umsetzung und Verbesserung.",
    reasoning: "To establish a robust agent2agent structure where literally everything has its own dedicated a2a agent, allowing massive parallel asynchronous evolution with full context to stay continuously updated and optimized. Sicherheit Performance Style documentation Sauberkeit Ordnung.",
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
