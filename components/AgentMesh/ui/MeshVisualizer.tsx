import React, { useState, useEffect } from 'react';
import { Mesh } from '../logic/Mesh';
import { AgentContext, Message } from '../logic/types';
import { AgentNode } from './AgentNode';
import { MessageLog } from './MessageLog';

interface MeshVisualizerProps {
  mesh: Mesh;
}

export const MeshVisualizer: React.FC<MeshVisualizerProps> = ({ mesh }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentContexts, setAgentContexts] = useState<AgentContext[]>([]);

  // Input states
  const [intent, setIntent] = useState('');
  const [location, setLocation] = useState('Global Scope');
  const [action, setAction] = useState('Analyze Request');
  const [content, setContent] = useState('');

  // Subscribe to mesh events
  useEffect(() => {
    // Initial state
    setMessages(mesh.getHistory());
    setAgentContexts(mesh.getAgents().map(a => a.getContext()));

    // Subscribe
    mesh.onMessage((_msg) => {
      // Refresh state
      setMessages([...mesh.getHistory()]);
      setAgentContexts(mesh.getAgents().map(a => a.getContext()));
    });
  }, [mesh]);

  const handleInject = () => {
    if (!intent || !content) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      sender: 'USER',
      intent,
      location,
      action,
      content,
      timestamp: Date.now(),
    };

    mesh.broadcast(newMessage);

    // Clear inputs
    setIntent('');
    setContent('');
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">Agent2Agent Mesh Simulation</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Using Agentic Context Engineering and AlphaEvolve</p>
      </header>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left column: Mesh control & Agents */}
        <div className="w-1/3 flex flex-col gap-4">

          {/* Inject Form */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-3">Inject Task</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Intent (What is wanted)</label>
                <input
                  type="text"
                  value={intent}
                  onChange={e => setIntent(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Optimize prompt"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Location (Where)</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. System Prompt"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Action (How)</label>
                <input
                  type="text"
                  value={action}
                  onChange={e => setAction(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Analyze and rewrite"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Content Details</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm h-24 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Detailed description..."
                />
              </div>
              <button
                onClick={handleInject}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Broadcast to Mesh
              </button>
            </div>
          </div>

          {/* Agent Visualizations */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex-1 overflow-hidden flex flex-col">
            <h2 className="text-lg font-semibold mb-3">Mesh Agents ({agentContexts.length})</h2>
            <div className="flex-1 overflow-y-auto flex flex-wrap content-start">
              {agentContexts.map(ctx => (
                <AgentNode key={ctx.id} context={ctx} />
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Message Log */}
        <div className="w-2/3">
          <MessageLog messages={messages} />
        </div>
      </div>
    </div>
  );
};
