import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Footer from '@/components/Footer';
import MeshCanvas from '@/components/AgentMesh/MeshCanvas';
import LogStream from '@/components/AgentMesh/LogStream';
import { createInitialState, tick } from '@/components/AgentMesh/simulationLogic';
import { SimulationState } from '@/components/AgentMesh/types';

export default function MeshPage() {
  const [state, setState] = useState<SimulationState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize state on mount (client-side only to avoid hydration mismatch if random IDs used)
  useEffect(() => {
    setState(createInitialState());
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setState((prev) => prev ? tick({ ...prev, isRunning: true }) : null);
      }, 500); // 2 ticks per second for visual clarity
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setState(createInitialState());
  };

  if (!state) return <div className="min-h-screen flex items-center justify-center">Loading Agent Mesh...</div>;

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
      <Head>
        <title>Agent Mesh Simulation - AGENTS.md</title>
        <meta name="description" content="Visual simulation of an autonomous multi-agent system optimizing prompts." />
      </Head>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="flex justify-between items-end border-b pb-4 border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agent Mesh Simulation</h1>
            <p className="text-gray-500 mt-2 max-w-2xl">
              An autonomous system of agents collaborating to optimize a prompt.
              The <strong>Generator</strong> creates variations, the <strong>Reviewer</strong> scores them,
              and the <strong>Optimizer</strong> tunes the Generator's parameters based on feedback.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleToggle}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                isRunning
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              }`}
            >
              {isRunning ? 'Pause Simulation' : 'Start Simulation'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-black/90 px-2 py-1 rounded text-xs font-mono border border-gray-200 dark:border-gray-800">
              Tick: {state.tickCount}
            </div>
            {/* Mesh Visualization */}
            <div className="w-full h-full flex items-center justify-center p-4">
               <MeshCanvas state={state} />
            </div>
          </div>

          <div className="lg:col-span-1 h-full">
            <LogStream logs={state.logs} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold mb-2 text-sm text-gray-500 uppercase tracking-wider">Current Best Prompt</h3>
                <p className="font-mono text-sm bg-gray-50 dark:bg-black p-3 rounded border border-gray-100 dark:border-gray-800">
                    {state.bestPrompt}
                </p>
            </div>
             <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold mb-2 text-sm text-gray-500 uppercase tracking-wider">System Efficiency</h3>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">{state.bestScore.toFixed(1)}</span>
                    <span className="text-gray-400 mb-1">/ 100</span>
                </div>
            </div>
             <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold mb-2 text-sm text-gray-500 uppercase tracking-wider">Total Operations</h3>
                <div className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                        <span>Generations:</span>
                        <span className="font-mono font-bold">{state.agents.find(a => a.role === 'GENERATOR')?.stats.messagesProcessed || 0}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Reviews:</span>
                        <span className="font-mono font-bold">{state.agents.find(a => a.role === 'REVIEWER')?.stats.messagesProcessed || 0}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Optimizations:</span>
                        <span className="font-mono font-bold">{state.agents.find(a => a.role === 'OPTIMIZER')?.stats.messagesProcessed || 0}</span>
                    </div>
                </div>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
