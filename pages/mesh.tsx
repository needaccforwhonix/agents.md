import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Mesh } from '../components/AgentMesh/logic/Mesh';
import { Agent } from '../components/AgentMesh/logic/Agent';
import { MeshVisualizer } from '../components/AgentMesh/ui/MeshVisualizer';

export default function MeshPage() {
  const [meshInstance, setMeshInstance] = useState<Mesh | null>(null);

  useEffect(() => {
    // Initialize Mesh only on client side to avoid SSR hydration mismatches with random UUIDs/Math.random
    const mesh = new Mesh();

    // Create a few initial agents
    const a1 = new Agent({ id: crypto.randomUUID(), name: 'Alpha Agent', initialParams: { creativity: 0.8 } });
    const a2 = new Agent({ id: crypto.randomUUID(), name: 'Beta Agent', initialParams: { analytical: 0.9 } });
    const a3 = new Agent({ id: crypto.randomUUID(), name: 'Gamma Agent', initialParams: { decisiveness: 0.8 } });

    mesh.addAgent(a1);
    mesh.addAgent(a2);
    mesh.addAgent(a3);

    // Initial broadcast to kick things off
    mesh.broadcast({
      id: crypto.randomUUID(),
      sender: 'SYSTEM',
      intent: 'Initialize Mesh',
      location: 'Global',
      action: 'Start',
      content: 'Agent Mesh initialized. Awaiting user input to begin collaborative optimization.',
      timestamp: Date.now()
    });

    setMeshInstance(mesh);
  }, []);

  if (!meshInstance) return <div className="p-8 text-center">Initializing Agent Mesh...</div>;

  return (
    <>
      <Head>
        <title>Agent Mesh Simulation</title>
        <meta name="description" content="Agent2Agent Mesh Simulation using AlphaEvolve and ACE" />
      </Head>
      <main>
        <MeshVisualizer mesh={meshInstance} />
      </main>
    </>
  );
}
