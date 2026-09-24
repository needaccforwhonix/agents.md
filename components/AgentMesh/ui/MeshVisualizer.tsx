import React, { useEffect, useState } from "react";
import { Mesh } from "../logic/Mesh";
import { Agent } from "../logic/Agent";
import { RuleBasedBrain } from "../logic/RuleBasedBrain";
import { Message } from "../logic/Types";
import type { FileNode } from "../../../pages/api/files";

export const MeshVisualizer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);

  const [meshRef, setMeshRef] = useState<Mesh | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);

  useEffect(() => {
    fetch("/api/files")
      .then((res) => res.json())
      .then((data) => setFileStructure(data))
      .catch((err) => console.error("Failed to fetch file structure:", err));
  }, []);

  useEffect(() => {
    if (!fileStructure || fileStructure.length === 0) return;

    // 1. Initialize Mesh instance
    const mesh = new Mesh();

    // 2. Create decoupled autonomous agents
    const brain = new RuleBasedBrain();
    const developerAgent = new Agent("agent-1", "DevBot", "Developer", brain, { responsiveness: 0.1 });
    const securityAgent = new Agent("agent-2", "SecBot", "Security Analyst", brain, { responsiveness: 0.05 });
    const qaAgent = new Agent("agent-3", "QABot", "Quality Assurance", brain, { responsiveness: 0.05 });
    const performanceAgent = new Agent("agent-4", "PerfBot", "Performance Optimizer", brain, { responsiveness: 0.05 });
    const styleAgent = new Agent("agent-5", "StyleBot", "Style Enforcer", brain, { responsiveness: 0.05 });
    const cleanlinessAgent = new Agent("agent-6", "CleanBot", "Cleanliness & Order", brain, { responsiveness: 0.05 });
    const optimizationAgent = new Agent("agent-7", "OptBot", "Prompt & Logic Optimizer", brain, { responsiveness: 0.05 });

    // 3. Register agents into the broadcast mesh
    mesh.registerAgent(developerAgent);
    mesh.registerAgent(securityAgent);
    mesh.registerAgent(qaAgent);
    mesh.registerAgent(performanceAgent);
    mesh.registerAgent(styleAgent);
    mesh.registerAgent(cleanlinessAgent);
    mesh.registerAgent(optimizationAgent);

    // Dynamically register an agent for every file and directory
    fileStructure.forEach((node) => {
      let role = "File Manager";
      if (node.isDirectory) {
        role = "Directory Manager";
      } else if (node.name.endsWith(".ts")) {
        role = "TypeScript File Manager";
      } else if (node.name.endsWith(".tsx")) {
        role = "React Component Manager";
      } else if (node.name.endsWith(".json")) {
        role = "JSON Config Manager";
      } else if (node.name.endsWith(".md")) {
        role = "Markdown Documenter";
      }

      const agent = new Agent(`dynamic-${node.path}`, node.path, role, brain, { responsiveness: 0.01 });
      mesh.registerAgent(agent);
    });

    setAgents(mesh.getAgents());
    setMeshRef(mesh);
  }, [fileStructure]);

  // 4. Start the initial simulation asynchronously
  const startSimulation = async () => {
    if (!meshRef || isSimulating) return;

    setIsSimulating(true);

    const startMessage: Message = {
      id: crypto.randomUUID(),
      senderId: "user-init",
      timestamp: Date.now(),
      what: "Input und Output müssen eindeutig beschreiben was wo wie gewollt ist. Dabei kann stets geholfen werden. So soll asynchron parallel alles weiter entwickelt werden und aktuell bleiben. Sicherheit Performance Style documentation Sauberkeit Ordnung. Optimierung dieser prompt und deren Umsetzung und Verbesserung. Inklusive Testing + Validierung + Update aller Dateien inkl. Projektordner Cleanup ohne Feature, Ideen oder Function Deletionen. Demock - Testing - ACE - CI/CD Pipeline - E2E - AST - Documentationen - Todo´s Creation + Implementationen + Improvements.",
      where: "Alle dynamisch registrierten Dateien, Verzeichnisse und Konfigurationsknoten im gesamten Projekt.",
      how: "Jeder A2A-Agent nutzt Agentic Context Engineering und den AlphaEvolve-Algorithmus mit Reasoning und vollständigem Kontext.",
      reasoning: "Um eine robuste Agent2Agent-Struktur zu stärken, die eine massive parallele asynchrone Evolution ermöglicht.",
    };

    await meshRef.broadcast(startMessage);

    // Update UI explicitly after full completion of recursive bounds
    setMessages([...meshRef.getMessages()]);
    setAgents([...meshRef.getAgents()]);
    setIsSimulating(false);
  };

  return (
    <div className="p-6 bg-slate-900 text-slate-200 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-400">Agent2Agent Broadcast Mesh Simulation</h1>
        <button
          onClick={startSimulation}
          disabled={isSimulating || !meshRef}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold rounded shadow transition-colors"
        >
          {isSimulating ? "Simulating..." : "Start Simulation"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages Stream */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold border-b border-slate-700 pb-2">Broadcast Stream</h2>
          <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
            {messages.length === 0 && <p className="text-slate-500">Initializing mesh broadcast...</p>}
            {messages.map((msg, idx) => (
              <div key={idx} className="p-4 bg-slate-800 rounded-lg shadow-sm border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-indigo-400">Sender: {msg.senderId}</span>
                  <span className="text-xs text-slate-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="space-y-2 mt-2">
                  <p><strong className="text-teal-300">What:</strong> {msg.what}</p>
                  <p><strong className="text-pink-300">Where:</strong> {msg.where}</p>
                  <p><strong className="text-amber-300">How:</strong> {msg.how}</p>
                  {msg.reasoning && <p><strong className="text-purple-300">Reasoning:</strong> {msg.reasoning}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agents State */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-slate-700 pb-2">Autonomous Agents ({agents.length})</h2>
          <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
            {agents.map((agent) => (
              <div key={agent.context.id} className="p-4 bg-slate-800 rounded-lg shadow-sm border border-slate-700">
                <h3 className="text-lg font-bold text-blue-300 break-words">{agent.context.name}</h3>
                <p className="text-sm text-slate-400 mb-3">{agent.context.role}</p>

                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Evolved Parameters</h4>
                <div className="bg-slate-900 p-2 rounded text-xs font-mono">
                  {Object.entries(agent.context.parameters).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-400">{key}:</span>
                      <span className="text-emerald-400">{typeof val === 'number' ? val.toFixed(4) : String(val)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-xs flex justify-between text-slate-500">
                  <span>Context Bounded History: {agent.context.history.length} msgs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
