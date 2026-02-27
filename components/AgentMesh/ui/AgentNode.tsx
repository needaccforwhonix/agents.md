import React from 'react';
import { AgentState, Message } from '../types';

interface AgentNodeProps {
  state: AgentState;
  lastMessage?: Message;
}

export const AgentNode: React.FC<AgentNodeProps> = ({ state, lastMessage }) => {
  const statusColors = {
    Idle: 'bg-gray-200 border-gray-400',
    Thinking: 'bg-yellow-100 border-yellow-400 animate-pulse',
    Acting: 'bg-green-100 border-green-500',
    Evolving: 'bg-purple-100 border-purple-500',
    Terminated: 'bg-red-200 border-red-500',
  };

  return (
    <div className={`p-4 border-2 rounded-lg shadow-sm flex flex-col gap-2 w-64 ${statusColors[state.status]}`}>
      <div className="flex justify-between items-center border-b border-gray-300 pb-2">
        <h3 className="font-bold text-lg">{state.name}</h3>
        <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200">
          {state.role}
        </span>
      </div>

      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span>Gen: {state.generation}</span>
          <span>Age: {state.age}</span>
        </div>
        <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-semibold">{state.status}</span>
        </div>
      </div>

      <div className="mt-2 bg-white/50 p-2 rounded text-xs h-24 overflow-y-auto">
        <strong className="block mb-1 text-gray-600">Genes:</strong>
        {Object.entries(state.genes).map(([key, gene]) => (
          <div key={key} className="flex justify-between">
            <span>{gene.trait}:</span>
            <span>{gene.value.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {lastMessage && (
        <div className="mt-2 text-xs bg-blue-50 p-2 rounded border border-blue-100">
          <strong className="block text-blue-800 mb-1">Last Action:</strong>
          <p className="line-clamp-3 italic text-gray-700">"{lastMessage.content}"</p>
        </div>
      )}
    </div>
  );
};
