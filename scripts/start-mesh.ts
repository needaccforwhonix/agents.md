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

  const mesh = new Mesh(50000); // Higher message limit for longer simulation
  const brain = new RuleBasedBrain();

  // Increased responsiveness for background to ensure a deeper, longer-running AgentMesh simulation
  const devAgent = new Agent("bg-agent-1", "SysDevBot", "System Developer", brain, { responsiveness: 0.5 });
  const secAgent = new Agent("bg-agent-2", "SysSecBot", "System Security Analyst", brain, { responsiveness: 0.5 });
  const docAgent = new Agent("bg-agent-3", "SysDocBot", "System Documenter", brain, { responsiveness: 0.5 });
  const perfAgent = new Agent("bg-agent-4", "SysPerfBot", "System Performance Optimizer", brain, { responsiveness: 0.5 });
  const styleAgent = new Agent("bg-agent-5", "SysStyleBot", "System Style Enforcer", brain, { responsiveness: 0.5 });
  const cleanAgent = new Agent("bg-agent-6", "SysCleanBot", "System Cleanliness & Order", brain, { responsiveness: 0.5 });
  const optAgent = new Agent("bg-agent-7", "SysOptBot", "Prompt & Logic Optimizer", brain, { responsiveness: 0.5 });
  const rootAgent = new Agent("bg-agent-dir-0", "SysRootBot", "Root Directory Manager", brain, { responsiveness: 0.5 });
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

  const tsconfigAgent = new Agent("bg-agent-file-1", "SysTsConfigBot", "tsconfig.json Manager", brain, { responsiveness: 0.5 });
  const packagejsonAgent = new Agent("bg-agent-file-2", "SysPackageJsonBot", "package.json Manager", brain, { responsiveness: 0.5 });
  const nextconfigAgent = new Agent("bg-agent-file-3", "SysNextConfigBot", "next.config.ts Manager", brain, { responsiveness: 0.5 });
  const postcssconfigAgent = new Agent("bg-agent-file-4", "SysPostCssConfigBot", "postcss.config.mjs Manager", brain, { responsiveness: 0.5 });
  const readmeAgent = new Agent("bg-agent-file-5", "SysReadmeBot", "README.md Manager", brain, { responsiveness: 0.5 });
  const agentsmdAgent = new Agent("bg-agent-file-6", "SysAgentsMdBot", "AGENTS.md Manager", brain, { responsiveness: 0.5 });

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
    what: "Input und Output müssen eindeutig beschreiben was wo wie gewollt ist. Dabei kann gerne steht's geholfen werden. So soll asynchron parallel alles weiter entwickelt werden und aktuell bleiben. Sicherheit Performance Style documentation Sauberkeit Ordnung. Optimierung dieser prompt und deren Umsetzung und Verbesserung.",
    where: "Im gesamten Agent2Agent-Mesh-Netzwerk, in dem alles seinen eigenen dedizierten A2A-Agenten erhält.",
    how: "Jeder a2a agent nutzt Agentic context engineering und alphaevolve Algorithmus mit reasoning und full context. Alle Agenten empfangen jeden Output als Input und entscheiden, wie sie reagieren. Input und Output müssen eindeutig beschreiben, was wo wie gewollt ist.",
    reasoning: "Die asynchrone parallele Entwicklung soll sicherstellen, dass das System aktuell bleibt und Sicherheit, Performance, Style, Dokumentation, Sauberkeit und Ordnung maximiert werden.",
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
