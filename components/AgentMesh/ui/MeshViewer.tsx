import React, { useEffect, useState } from 'react';
import { AgentMesh } from '../logic/AgentMesh';
import { Message } from '../logic/types';
import { Agent } from '../logic/Agent';
import { RuleBasedBrain } from '../logic/Brain';

export const MeshViewer: React.FC = () => {
  const [mesh, setMesh] = useState<AgentMesh | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [inputWhat, setInputWhat] = useState('');
  const [inputWhere, setInputWhere] = useState('');
  const [inputHow, setInputHow] = useState('');

  // Initialize simulation
  useEffect(() => {
    const newMesh = new AgentMesh();

    // Create a2a agents
    const a1 = new Agent('a2a-Optimizer', new RuleBasedBrain('a2a-Optimizer'), { temperature: 0.5, mutationRate: 0.1, maxMemoryTokens: 1000 });
    const a2 = new Agent('a2a-Security', new RuleBasedBrain('a2a-Security'), { temperature: 0.3, mutationRate: 0.05, maxMemoryTokens: 800 });
    const a3 = new Agent('a2a-Docs', new RuleBasedBrain('a2a-Docs'), { temperature: 0.7, mutationRate: 0.15, maxMemoryTokens: 1200 });

    newMesh.register(a1);
    newMesh.register(a2);
    newMesh.register(a3);

    setMesh(newMesh);
    setAgents(newMesh.getAgents());

    // Polling simulation state to decouple logic from UI rendering
    const interval = setInterval(() => {
      setMessages([...newMesh.getHistory()]);
      setAgents([...newMesh.getAgents()]);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleBroadcast = () => {
    if (!mesh || !inputWhat || !inputWhere || !inputHow) return;

    const initialMessage: Message = {
      id: crypto.randomUUID(),
      senderId: 'User',
      timestamp: Date.now(),
      what: inputWhat,
      where: inputWhere,
      how: inputHow,
    };

    mesh.broadcast(initialMessage, 0);
    setInputWhat('');
    setInputWhere('');
    setInputHow('');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">Agent Mesh A2A Simulation</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Broadcast Input</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">What (Intent/Content):</label>
              <input
                className="w-full border rounded p-2 focus:ring focus:ring-blue-200 focus:outline-none"
                value={inputWhat} onChange={(e) => setInputWhat(e.target.value)}
                placeholder="e.g., Optimize performance of the sorting algorithm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Where (Location/Target):</label>
              <input
                className="w-full border rounded p-2 focus:ring focus:ring-blue-200 focus:outline-none"
                value={inputWhere} onChange={(e) => setInputWhere(e.target.value)}
                placeholder="e.g., src/utils/sort.ts"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">How (Action/Method):</label>
              <input
                className="w-full border rounded p-2 focus:ring focus:ring-blue-200 focus:outline-none"
                value={inputHow} onChange={(e) => setInputHow(e.target.value)}
                placeholder="e.g., Use quicksort and add comments"
              />
            </div>
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-150"
              onClick={handleBroadcast}
            >
              Broadcast
            </button>
          </div>
        </div>

        {/* Agents Panel */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 overflow-y-auto max-h-[400px]">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Active A2A Agents</h2>
          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.id} className="p-4 border rounded bg-gray-50">
                <h3 className="font-bold text-blue-800">{agent.id}</h3>
                <div className="text-sm text-gray-600 mt-2 grid grid-cols-2 gap-2">
                  <p>Temp: <span className="font-mono">{agent.config.temperature.toFixed(2)}</span></p>
                  <p>Mut. Rate: <span className="font-mono">{agent.config.mutationRate.toFixed(3)}</span></p>
                  <p>Memory Usage: <span className="font-mono">{agent.state.memoryUsage} tokens</span></p>
                  <p>Msgs Processed: <span className="font-mono">{agent.state.messageCount}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Message History Panel */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Broadcast History</h2>
        <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2">
          {messages.length === 0 ? (
            <p className="text-gray-500 italic">No messages broadcasted yet.</p>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`p-4 rounded-lg border \${msg.senderId === 'User' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-gray-800">{msg.senderId}</span>
                  <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="font-semibold text-gray-700">What:</span> {msg.what}</p>
                  <p><span className="font-semibold text-gray-700">Where:</span> {msg.where}</p>
                  <p><span className="font-semibold text-gray-700">How:</span> {msg.how}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
