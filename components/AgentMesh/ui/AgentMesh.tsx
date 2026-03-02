import React, { useEffect, useState, useRef } from 'react';
import { AgentMessage, AgentState } from '../logic/Types';
import { Simulation } from '../logic/Simulation';
import { Agent } from '../logic/Agent';

const AgentMesh: React.FC = () => {
  const [history, setHistory] = useState<AgentMessage[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const simulationRef = useRef<Simulation | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize strictly decoupled simulation
    const simulation = new Simulation();

    simulation.setCallbacks(
      (newHistory) => setHistory(newHistory),
      (newAgents) => setAgents(newAgents)
    );

    // Register agents into the mesh
    const a1 = new Agent('agent-1', 'Alpha');
    const a2 = new Agent('agent-2', 'Beta');
    const a3 = new Agent('agent-3', 'Gamma');

    simulation.registerAgent(a1);
    simulation.registerAgent(a2);
    simulation.registerAgent(a3);

    simulationRef.current = simulation;

    // Start simulation automatically for demonstration
    simulation.start();

    return () => {
      simulation.stop();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll log
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans p-6 overflow-hidden">
      <h1 className="text-3xl font-bold mb-6 text-blue-400 border-b border-gray-700 pb-2">Agent2Agent Mesh Simulation</h1>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left Panel: Agent Statuses */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
          <h2 className="text-xl font-semibold text-gray-300">Active Agents</h2>
          {agents.map((agent) => (
            <div key={agent.state.id} className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold text-green-400">{agent.state.name}</span>
                <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider font-bold ${
                  agent.state.status === 'processing' ? 'bg-yellow-500/20 text-yellow-500' :
                  agent.state.status === 'error' ? 'bg-red-500/20 text-red-500' :
                  'bg-blue-500/20 text-blue-500'
                }`}>
                  {agent.state.status}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                <div>Temp: {agent.state.parameters.temperature.toFixed(2)}</div>
                <div>Creativity: {agent.state.parameters.creativity.toFixed(2)}</div>
                <div>Focus: {agent.state.parameters.focus.toFixed(2)}</div>
                <div>Memory: {agent.state.memory.length} items</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Panel: Bounded History Log */}
        <div className="w-2/3 flex flex-col bg-gray-800 rounded-lg shadow-md border border-gray-700 p-4 min-h-0">
          <h2 className="text-xl font-semibold text-gray-300 mb-4 border-b border-gray-700 pb-2">Mesh Broadcast Log</h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {history.map((msg) => {
              const sender = agents.find(a => a.state.id === msg.senderId);
              return (
                <div key={msg.id} className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-blue-300">{sender?.state.name || msg.senderId}</span>
                    <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-sm space-y-1 mt-2">
                    <div className="flex"><span className="text-gray-400 w-16 uppercase text-xs font-bold tracking-wider pt-1">What:</span> <span className="flex-1 text-green-300">{msg.what}</span></div>
                    <div className="flex"><span className="text-gray-400 w-16 uppercase text-xs font-bold tracking-wider pt-1">Where:</span> <span className="flex-1 text-purple-300">{msg.where}</span></div>
                    <div className="flex"><span className="text-gray-400 w-16 uppercase text-xs font-bold tracking-wider pt-1">How:</span> <span className="flex-1 text-yellow-300">{msg.how}</span></div>
                    <div className="mt-2 p-2 bg-gray-900 rounded text-gray-300 whitespace-pre-wrap font-mono text-xs">
                      {msg.rawContent}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentMesh;
