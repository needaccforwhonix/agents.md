import React, { useState } from 'react';
import Head from 'next/head';
import { MeshCanvas } from '../components/AgentMesh/ui/MeshCanvas';
import { SimulationControls } from '../components/AgentMesh/ui/SimulationControls';

export default function AgentMeshPage() {
  const [isRunning, setIsRunning] = useState(false);

  const toggleSimulation = () => setIsRunning(!isRunning);
  const resetSimulation = () => {
    // Reload page to reset state simply for this MVP
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <Head>
        <title>Agent Mesh Simulation</title>
        <meta name="description" content="Agent2Agent Mesh Simulation with AlphaEvolve and ACE" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Agent Mesh Simulation
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            A decentralized Multi-Agent System where agents evolve, reason, and interact via ACE (Agentic Context Engineering).
          </p>
        </header>

        <section className="mb-8">
          <SimulationControls
            isRunning={isRunning}
            onToggle={toggleSimulation}
            onReset={resetSimulation}
          />
        </section>

        <section>
          <MeshCanvas isRunning={isRunning} />
        </section>

        <footer className="mt-12 text-center text-sm text-gray-500">
           Agents utilize AlphaEvolve algorithms to mutate their parameters over generations.
        </footer>
      </main>
    </div>
  );
}
