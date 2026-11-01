import fs from "fs";
import path from "path";
import { Mesh } from "../src/logic/Mesh";
import { Agent } from "../src/logic/Agent";
import { RuleBasedBrain } from "../src/logic/RuleBasedBrain";
import { LLMBrain } from "../src/logic/LLMBrain";
import { Message } from "../src/logic/Types";
import { createDynamicAgent } from "../src/logic/DynamicAgentRegistry";

function registerDynamicAgents(dir: string, mesh: Mesh, brain: RuleBasedBrain) {
  const ignored = new Set(["node_modules", ".git", ".next", "test-results", "public", ".github", "pnpm-lock.yaml"]);
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (ignored.has(file)) continue;

    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      const agent = createDynamicAgent(`dir-${fullPath}`, fullPath, true, file, brain, 0.05);
      mesh.registerAgent(agent);
      registerDynamicAgents(fullPath, mesh, brain);
    } else {
      const agent = createDynamicAgent(`file-${fullPath}`, fullPath, false, file, brain, 0.05);
      mesh.registerAgent(agent);
    }
  }
}

async function startBackgroundMesh() {
  console.log("Initializing Agent2Agent Background Mesh...");

  const mesh = new Mesh(100000); // Higher message limit for longer simulation
  const brain = new LLMBrain();

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

  const { DBPersistence } = await import("../src/logic/DBPersistence");
  const dbPersistence = new DBPersistence();


  try {
    console.log("Hydrating Mesh state from SQLite database...");

    const loadedMessages = dbPersistence.loadMessages(1000);
    if (loadedMessages && loadedMessages.length > 0) {
      mesh.setMessages(loadedMessages);
    }

    const loadedAgents = dbPersistence.loadAgentStates();
    if (loadedAgents && loadedAgents.length > 0) {
      const agentMap = new Map(mesh.getAgents().map(a => [a.context.id, a]));

      for (const loadedAgentData of loadedAgents) {
        const existingAgent = agentMap.get(loadedAgentData.id);
        if (existingAgent) {
          // Restore context variables
          existingAgent.context.parameters = loadedAgentData.parameters as Record<string, number | undefined>;
          // History gets dropped in save step to save memory, start empty
          existingAgent.context.history = [];
        }
      }

    }
  } catch (err) {
    console.warn("Failed to hydrate state from database:", err);
  }

  const initialMessage: Message = {
    id: crypto.randomUUID(),
    senderId: "system-cron",
    timestamp: Date.now(),
    what: "Jeder Knotenpunkt, jedes Verzeichnis und jede Datei der Architektur wird durch einen dedizierten Agent2Agent-Agenten repräsentiert. Eingehende sowie ausgehende Nachrichten müssen ausnahmslos explizit und unmissverständlich deklarieren, was genau modifiziert werden soll, wo die Änderung vorzunehmen ist und wie die technische Umsetzung erfolgt. Ziel ist die fortlaufende, asynchrone und maximal parallele Evolution der Codebasis. Bei Fragen zur Umsetzung wird jederzeit Unterstützung angeboten. Der Fokus liegt permanent auf Sicherheit, Performance, Code-Style, Dokumentation, Sauberkeit und Ordnung. Die vorliegenden System-Prompts sollen iterativ optimiert und in ihrer Umsetzung kontinuierlich verbessert werden. Pro Jules-Session muss mindestens ein vollständiger Agent2Agent-Agent-Mesh-Lauf initiiert werden, bevorzugt mit längerer Laufzeit. Es ist stets ein ganzheitlicher Ansatz zu verfolgen: Testing, Validierung, Aktualisierung aller betroffenen Dateien inklusive tiefgreifendem Projektordner-Cleanup. Es gilt das uneingeschränkte WORM-Prinzip (Write Once, Read Many): Existierende Features, Ideen oder Funktionen dürfen unter keinen Umständen gelöscht werden (strictly additive). Die Integration von Demock, Testing, ACE (Agentic Context Engineering), CI/CD-Pipelines, E2E-Tests, AST-Validierungen, Dokumentationserweiterungen sowie das Erstellen und Implementieren von TODOs und generellen Verbesserungen ist obligatorisch. Es erfolgt eine fortlaufende Hintergrundoptimierung und Refaktorierung innerhalb dieser Agent2Agent-Struktur.",
    where: "Die Ausführung erstreckt sich über alle dynamisch registrierten Dateien, Verzeichnisse und Konfigurationsknoten innerhalb des gesamten Projekts. Die Zielorte (Where) müssen stets eindeutig spezifiziert werden. Dies schließt die Aktualisierung sämtlicher tangierter Dateien sowie ein kontinuierliches Projektordner-Cleanup ein, um maximale Sauberkeit und Ordnung aufrechtzuerhalten.",
    how: "Sämtliche A2A-Agenten nutzen zwingend Agentic Context Engineering (ACE) für ein präzises Token-Bound-Management und den AlphaEvolve-Algorithmus zur dynamischen Parameter-Mutation unter Einbezug von Reasoning und dem vollständigen historischen Kontext. Jeder Output im Mesh dient allen anderen Agenten simultan als Input, wobei jeder Agent autonom entscheidet, ob und wie er reagiert. Aktionen müssen präzise definiert werden (Was, Wo, Wie). Alle Änderungen müssen strikt additiv und non-destruktiv erfolgen. Die Umsetzung beinhaltet zwingend Testing, Validierung, das Aktualisieren betroffener Dateien sowie Projektordner-Cleanup ohne Feature- oder Funktionsverlust. Weiterhin sind Demock-Strategien, Testing, ACE, CI/CD-Pipelines, E2E-Tests, AST-Überprüfungen, Dokumentationen und TODO-Generierung/Implementierung sowie allgemeine Improvements konsequent anzuwenden. Die Formatierung der Output-Analyse für Jules muss exakt folgendem Schema entsprechen: @jules [Root Cause Analysis des Problems (Include your CoT here)] + [Actionable Code-Fix] + [Quality/Performance Improvements].",
    reasoning: "Diese weitreichenden Maßnahmen dienen der Etablierung und Stärkung einer hochrobusten Agent2Agent-Architektur. Diese Struktur ermöglicht eine massive, parallele und asynchrone Evolution der Codebasis, sodass das System kontinuierlich aktualisiert, tiefgreifend optimiert und extrem sauber strukturiert bleibt. Da alle Agenten jeden Output als Input empfangen und autonom über ihre Reaktion entscheiden, entsteht eine sich selbst verbessernde Intelligenz. Die Optimierung dieses Prompts sowie dessen praktische Umsetzung und kontinuierliche Verbesserung sind zentrale Bestandteile dieser Evolution.",
  };

  console.log("Broadcasting initial task to mesh...");
  await mesh.broadcast(initialMessage);

  console.log("Background Mesh Run Complete.");

  // Dump basic metrics
  console.log(`Total messages processed: ${mesh.getMessages().length}`);
  mesh.getAgents().forEach(agent => {
    console.log(`Agent ${agent.context.name} generation: ${agent.context.parameters.generation}`);
  });

  // Save state to SQLite database for persistence
  try {
    console.log("Saving mesh state to SQLite database...");
    // Keep last 1000 messages
    const recentMessages = mesh.getMessages().slice(-1000);
    for (const msg of recentMessages) {
      dbPersistence.saveMessage(msg);
    }

    for (const agent of mesh.getAgents()) {
      dbPersistence.saveAgentState(agent.context);
    }

    dbPersistence.close();
    console.log(`Mesh state successfully saved to SQLite database.`);
  } catch (err) {
    console.warn("Could not save Mesh state to database:", err);
  }
}

startBackgroundMesh().catch(err => {
  console.error("Background Mesh Error:", err);
  process.exit(1);
});
