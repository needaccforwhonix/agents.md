import Head from 'next/head';
import React, { useEffect, useState, useRef } from 'react';
import { MeshSimulation } from '../components/AgentMesh/logic/MeshSimulation';
import { AgentState, Message } from '../components/AgentMesh/logic/types';
import { MeshVisualizer } from '../components/AgentMesh/ui/MeshVisualizer';
import { ActivityLog } from '../components/AgentMesh/ui/ActivityLog';
import { Controls } from '../components/AgentMesh/ui/Controls';

export default function MeshPage() {
  const simulationRef = useRef<MeshSimulation | null>(null);
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // Initialize simulation once
    const sim = new MeshSimulation(4);
    simulationRef.current = sim;

    // Subscribe to updates
    const unsubscribe = sim.subscribe(() => {
      // Create shallow copies to trigger React updates
      // We map over agents to get their current state snapshot
      setAgents(sim.getAgents().map(a => ({ ...a.state, params: { ...a.state.params } })));
      setMessages([...sim.messages]);
      setIsRunning(sim.isRunning);
    });

    // Initial state
    setAgents(sim.getAgents().map(a => ({ ...a.state, params: { ...a.state.params } })));
    setMessages([...sim.messages]);
    setIsRunning(sim.isRunning);

    return () => {
      sim.stop();
      unsubscribe();
    };
  }, []);

  const handleStart = () => {
    if (simulationRef.current) {
        simulationRef.current.start();
        setIsRunning(true);
    }
  };

  const handleStop = () => {
    if (simulationRef.current) {
        simulationRef.current.stop();
        setIsRunning(false);
    }
  };

  const handleAddAgent = () => {
    if (simulationRef.current) {
        simulationRef.current.addAgent(`Agent_${agents.length + 1}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <Head>
        <title>Agent Mesh Simulation</title>
        <meta name="description" content="Agent2Agent Mesh Simulation with AlphaEvolve" />
      </Head>

      <main className="max-w-7xl mx-auto space-y-6">
        <header className="border-b border-gray-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Agent Mesh Simulation
          </h1>
          <p className="text-gray-500 mt-2">
            Asynchronous parallel Agent2Agent communication with AlphaEvolve parameter mutation.
          </p>
        </header>

        <Controls
          isRunning={isRunning}
          onStart={handleStart}
          onStop={handleStop}
          onAddAgent={handleAddAgent}
          agentCount={agents.length}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
          <div className="lg:col-span-2 overflow-y-auto border border-gray-800 rounded-lg bg-gray-900/50 p-4 custom-scrollbar">
            <h2 className="text-xl font-bold mb-4 text-gray-300 sticky top-0 bg-gray-900/90 py-2 z-10 backdrop-blur-sm">Agent Grid</h2>
            <MeshVisualizer agents={agents} />
          </div>

          <div className="lg:col-span-1 h-full flex flex-col gap-4">
             <ActivityLog messages={messages} />

             <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-xs text-gray-400">
               <h3 className="font-bold text-gray-300 mb-2">System Status</h3>
               <p className="flex justify-between"><span>Algorithm:</span> <span className="text-white">AlphaEvolve v1.0</span></p>
               <p className="flex justify-between"><span>Context:</span> <span className="text-white">Dynamic Simulated</span></p>
               <p className="flex justify-between"><span>Mutation Rate:</span> <span className="text-white">0.05 / tick</span></p>
               <p className="flex justify-between"><span>Cycle Time:</span> <span className="text-white">1000ms</span></p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
