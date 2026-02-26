import React from 'react';
import { Agent, Message } from '../types';
import { AgentCard } from './AgentCard';
import { BroadcastLog } from './BroadcastLog';
import { ControlPanel } from './ControlPanel';

interface MeshLayoutProps {
  agents: Agent[];
  messages: Message[];
  onAddAgent: (config: any) => void;
  onBroadcast: (content: string, senderId: string, senderName: string) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
}

export function MeshLayout({
  agents,
  messages,
  onAddAgent,
  onBroadcast,
  isRunning,
  setIsRunning
}: MeshLayoutProps) {

  const handleManualBroadcast = (msg: string) => {
    onBroadcast(msg, 'manual', 'Operator');
  };

  const handleAddAgent = (name: string, traits: any) => {
    // Generate a random ID
    const id = Math.random().toString(36).substr(2, 9);
    onAddAgent({
      id,
      name,
      systemPrompt: "You are a helpful agent in a mesh network.",
      initialTraits: traits
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      {/* Header / Control Panel Area */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 sticky top-0">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Agent Mesh Simulation (A2A Network)</h1>
          <ControlPanel
            isRunning={isRunning}
            onToggle={() => setIsRunning(!isRunning)}
            onAddAgent={handleAddAgent}
            onBroadcast={handleManualBroadcast}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 overflow-hidden max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left Column: Agents Grid */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto pr-2 pb-10">
          <h2 className="text-lg font-semibold sticky top-0 bg-gray-50 dark:bg-gray-900 py-2 z-10">Active Agents ({agents.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
            {agents.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500">No agents active. Add an agent to start.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Broadcast Log */}
        <div className="flex flex-col h-full overflow-hidden">
          <BroadcastLog messages={messages} />
        </div>
      </div>
    </div>
  );
}
