import { useEffect, useRef, useState } from 'react';
import { Simulation } from '../logic/Simulation';
import { AgentState, Message } from '../logic/types';
import { AgentList } from './AgentList';
import { MessageLog } from './MessageLog';

export const MeshDashboard: React.FC = () => {
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Use a ref to persist the simulation instance across re-renders
  const simulationRef = useRef<Simulation | null>(null);

  // Initialize simulation
  useEffect(() => {
    simulationRef.current = new Simulation((newAgents, newMessages) => {
      setAgents(newAgents);
      setMessages(newMessages);
    });

    // Add default agents for the Agent2Agent mesh
    simulationRef.current.addAgent('Analyzer Alpha');
    simulationRef.current.addAgent('Optimizer Beta');
    simulationRef.current.addAgent('Security Gamma');

    return () => {
      // Cleanup if needed (e.g., clear any internal timers in a more complex setup)
    };
  }, []);

  const handleStartSimulation = () => {
    setIsRunning(true);

    // Create a genesis message to kick off the broadcast
    const genesisMessage: Message = {
      id: crypto.randomUUID(),
      senderId: 'system',
      what: 'Initialize full Agent2Agent Agent mesh session.',
      where: 'global.a2a.network',
      how: 'Use Agentic context engineering and alphaEvolve algorithms with full reasoning context.',
      timestamp: Date.now(),
    };

    simulationRef.current?.broadcast(genesisMessage);
  };

  const handleManualBroadcast = () => {
    const promptMessage: Message = {
      id: crypto.randomUUID(),
      senderId: 'user',
      what: 'Optimize this prompt and enforce cleanliness and documentation.',
      where: 'frontend.mesh.dashboard',
      how: 'Analyze current state, provide feedback, and update context.',
      timestamp: Date.now(),
    };

    simulationRef.current?.broadcast(promptMessage);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 pb-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2 tracking-tight">
              A2A Mesh Protocol
            </h1>
            <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
              Agent2Agent architecture where every output becomes an input.
              Powered by Agentic Context Engineering (ACE) and AlphaEvolve algorithms.
            </p>
          </div>

          <div className="flex gap-3">
            {!isRunning ? (
              <button
                onClick={handleStartSimulation}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-md font-bold transition-colors shadow-lg shadow-blue-500/20"
              >
                Initialize Mesh Session
              </button>
            ) : (
              <button
                onClick={handleManualBroadcast}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-md font-bold transition-colors shadow-lg shadow-purple-500/20"
              >
                Inject Context Prompt
              </button>
            )}
          </div>
        </header>

        <main>
          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 backdrop-blur-sm">
            <AgentList agents={agents} />
          </div>

          <div className="mt-8">
            <MessageLog messages={messages} agents={agents} />
          </div>
        </main>
      </div>
    </div>
  );
};
