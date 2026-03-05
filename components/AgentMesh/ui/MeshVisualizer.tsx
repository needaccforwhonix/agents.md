import React, { useEffect, useState } from "react";
import { Mesh } from "../logic/Mesh";
import { Agent } from "../logic/Agent";
import { RuleBasedBrain } from "../logic/RuleBasedBrain";
import { Message } from "../logic/Types";

export const MeshVisualizer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    // 1. Initialize Mesh instance
    const mesh = new Mesh();

    // 2. Create decoupled autonomous agents
    const brain = new RuleBasedBrain();
    const developerAgent = new Agent("agent-1", "DevBot", "Developer", brain, { responsiveness: 0.1 });
    const securityAgent = new Agent("agent-2", "SecBot", "Security Analyst", brain, { responsiveness: 0.05 });
    const qaAgent = new Agent("agent-3", "QABot", "Quality Assurance", brain, { responsiveness: 0.05 });

    // 3. Register agents into the broadcast mesh
    mesh.registerAgent(developerAgent);
    mesh.registerAgent(securityAgent);
    mesh.registerAgent(qaAgent);

    setAgents(mesh.getAgents());

    // 4. Start the initial simulation asynchronously
    const simulate = async () => {
      const startMessage: Message = {
        id: crypto.randomUUID(),
        senderId: "user-init",
        timestamp: Date.now(),
        what: "Implement AST analyzer component for dynamic context testing",
        where: "components/AgentMesh/logic/AST.ts",
        how: "Utilize TypeScript Compiler API for parsing and bounding evaluation.",
      };

      await mesh.broadcast(startMessage);

      // Update UI explicitly after full completion of recursive bounds
      setMessages([...mesh.getMessages()]);
      setAgents([...mesh.getAgents()]);
    };

    simulate();
  }, []);

  return (
    <div className="p-6 bg-slate-900 text-slate-200 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">Agent2Agent Broadcast Mesh Simulation</h1>

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
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agents State */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b border-slate-700 pb-2">Autonomous Agents</h2>
          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.context.id} className="p-4 bg-slate-800 rounded-lg shadow-sm border border-slate-700">
                <h3 className="text-lg font-bold text-blue-300">{agent.context.name}</h3>
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
