import React, { useEffect, useState, useRef } from 'react';
import { Agent } from '../logic/Agent';
import { Mesh } from '../logic/Mesh';
import { RuleBasedBrain } from '../logic/Brain';
import { AgentGene, Message } from '../types';
import { AgentNode } from './AgentNode';

interface MeshCanvasProps {
  isRunning: boolean;
}

// Initial Population Config
const INITIAL_AGENTS_COUNT = 4;
const BASE_GENES: Record<string, AgentGene> = {
  aggressiveness: { trait: 'Aggressiveness', value: 0.5, mutationRate: 0.1 },
  cooperation: { trait: 'Cooperation', value: 0.5, mutationRate: 0.1 },
  creativity: { trait: 'Creativity', value: 0.5, mutationRate: 0.1 },
};

export const MeshCanvas: React.FC<MeshCanvasProps> = ({ isRunning }) => {
  const [mesh] = useState(() => new Mesh());
  const [agents, setAgents] = useState<Agent[]>([]);
  const [lastMessages, setLastMessages] = useState<Record<string, Message>>({});
  const [tick, setTick] = useState(0);

  // Initialize Mesh
  useEffect(() => {
    // Check if already populated to avoid re-init on strict mode double render
    if (mesh.getAgents().length > 0) return;

    const roles = ['Worker', 'Observer', 'Critic', 'Executor'] as const;

    for (let i = 0; i < INITIAL_AGENTS_COUNT; i++) {
      const id = `agent-${i + 1}`;
      const brain = new RuleBasedBrain();
      const agent = new Agent(
        id,
        `Agent ${i + 1}`,
        roles[i % roles.length],
        JSON.parse(JSON.stringify(BASE_GENES)), // Deep copy
        brain
      );
      mesh.register(agent);
    }

    // Subscribe to updates
    mesh.subscribe((msg) => {
        setLastMessages(prev => ({
            ...prev,
            [msg.from]: msg
        }));
    });

    setAgents(mesh.getAgents());
  }, [mesh]);

  // Simulation Loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(async () => {
        // 1. Pick a random agent to act (simulate async parallelism)
        // In a real system, they would act on their own triggers.
        const currentAgents = mesh.getAgents();
        if (currentAgents.length === 0) return;

        const randomAgent = currentAgents[Math.floor(Math.random() * currentAgents.length)];
        const output = await randomAgent.act();

        if (output) {
            mesh.broadcast(output);
        } else {
             // Force an initial interaction if silence
            if (Math.random() < 0.05) { // 5% chance to spark conversation
                const spark: Message = {
                    id: crypto.randomUUID(),
                    from: 'SYSTEM',
                    to: 'ALL',
                    content: "System Event: Optimize current process.",
                    timestamp: Date.now(),
                    type: 'System'
                };
                mesh.broadcast(spark);
            }
        }

        // Force re-render of agent states
        setTick(t => t + 1);

    }, 800); // Tick speed

    return () => clearInterval(interval);
  }, [isRunning, mesh]);


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50 min-h-[500px] border rounded-xl">
        {agents.map(agent => (
            <AgentNode
                key={agent.state.id}
                state={{...agent.state}} // Spread to force new ref if mutations happen in place
                lastMessage={lastMessages[agent.state.id]}
            />
        ))}
    </div>
  );
};
