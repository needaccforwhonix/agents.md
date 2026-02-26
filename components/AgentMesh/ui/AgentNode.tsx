import React from 'react';
import { AgentState } from '../logic/types';

interface AgentNodeProps {
  agent: AgentState;
}

export const AgentNode: React.FC<AgentNodeProps> = ({ agent }) => {
  const getStatusColor = (status: AgentState['status']) => {
    switch (status) {
      case 'processing': return 'bg-yellow-500 animate-pulse';
      case 'cooldown': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="p-4 border border-gray-700 rounded-lg bg-gray-800 text-white shadow-lg transition-all duration-300 hover:scale-105">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">{agent.name}</h3>
        <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} title={agent.status}></div>
      </div>

      <div className="text-xs text-gray-400 mb-2">ID: {agent.id}</div>

      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span>Energy</span>
          <span>{Math.round(agent.params.energy)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-green-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, agent.params.energy))}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500">Curiosity</span>
          <div className="font-mono">{agent.params.curiosity.toFixed(2)}</div>
        </div>
        <div>
          <span className="text-gray-500">Creativity</span>
          <div className="font-mono">{agent.params.creativity.toFixed(2)}</div>
        </div>
        <div>
          <span className="text-gray-500">Aggression</span>
          <div className="font-mono">{agent.params.aggression.toFixed(2)}</div>
        </div>
        <div>
          <span className="text-gray-500">Responsiveness</span>
          <div className="font-mono">{agent.params.responsiveness.toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400 border-t border-gray-700 pt-2">
        Last activity: {agent.lastActionTime > 0 ? new Date(agent.lastActionTime).toLocaleTimeString() : 'Never'}
      </div>
    </div>
  );
};
