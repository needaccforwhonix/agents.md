import React from 'react';
import { AgentState } from '../logic/types';
import { AgentNode } from './AgentNode';

interface MeshVisualizerProps {
  agents: AgentState[];
}

export const MeshVisualizer: React.FC<MeshVisualizerProps> = ({ agents }) => {
  if (!agents || agents.length === 0) {
    return <div className="text-gray-500 text-center p-8">No agents active.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {agents.map(agent => (
        <AgentNode key={agent.id} agent={agent} />
      ))}
    </div>
  );
};
