import React, { useEffect } from 'react';
import Head from 'next/head';
import { useAgentMesh } from '@/components/AgentMesh/logic/useAgentMesh';
import { MeshLayout } from '@/components/AgentMesh/ui/MeshLayout';

export default function AgentMeshPage() {
  const { messages, agents, addAgent, broadcast, isRunning, setIsRunning } = useAgentMesh();

  // Add a default agent on mount if none exist
  useEffect(() => {
    if (agents.length === 0) {
      addAgent({
        id: 'agent-alpha',
        name: 'Alpha Agent',
        systemPrompt: "You are the first agent. Introduce yourself.",
        initialTraits: {
          assertiveness: { name: 'Assertiveness', value: 0.8, description: 'High tendency to speak' },
          verbosity: { name: 'Verbosity', value: 0.6, description: 'Moderate length' },
          creativity: { name: 'Creativity', value: 0.5, description: 'Standard creativity' }
        }
      });
      addAgent({
        id: 'agent-beta',
        name: 'Beta Agent',
        systemPrompt: "You are a reactive agent. Question everything.",
        initialTraits: {
          assertiveness: { name: 'Assertiveness', value: 0.4, description: 'Low tendency to speak' },
          verbosity: { name: 'Verbosity', value: 0.4, description: 'Concise' },
          creativity: { name: 'Creativity', value: 0.9, description: 'High creativity' }
        }
      });
    }
  }, []); // Run once

  return (
    <>
      <Head>
        <title>Agent Mesh Simulation | A2A Network</title>
        <meta name="description" content="Agent-to-Agent autonomous mesh network simulation using AlphaEvolve logic." />
      </Head>

      <MeshLayout
        agents={agents}
        messages={messages}
        onAddAgent={addAgent}
        onBroadcast={broadcast}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
      />
    </>
  );
}
