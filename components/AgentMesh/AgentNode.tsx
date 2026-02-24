import React from 'react';
import { Agent } from './types';

interface AgentNodeProps {
  agent: Agent;
}

export default function AgentNode({ agent }: AgentNodeProps) {
  const statusColors = {
    IDLE: 'bg-gray-400',
    PROCESSING: 'bg-green-500 animate-pulse',
    WAITING: 'bg-yellow-500',
  };

  return (
    <div
      className="p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col gap-2 w-64 transition-all duration-300"
      style={{ borderTopWidth: '4px', borderTopColor: agent.color }}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100">{agent.role}</h3>
        <span className="text-xs text-gray-400 font-mono">{agent.id.substring(0, 6)}</span>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className={`w-2 h-2 rounded-full ${statusColors[agent.status] || 'bg-gray-400'}`} />
        <span className="uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">{agent.status}</span>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded text-xs font-mono mt-2 space-y-1">
        <div className="flex justify-between">
          <span>Creativity:</span>
          <span>{agent.parameters.creativity.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Strictness:</span>
          <span>{agent.parameters.strictness.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Efficiency:</span>
          <span>{agent.parameters.efficiency.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-500">
        <div className="text-center bg-gray-100 dark:bg-gray-800 p-1 rounded">
          <div className="font-bold text-gray-700 dark:text-gray-300">{agent.stats.messagesProcessed}</div>
          <div>Msgs</div>
        </div>
        <div className="text-center bg-gray-100 dark:bg-gray-800 p-1 rounded">
          <div className="font-bold text-gray-700 dark:text-gray-300">{agent.stats.evolutions}</div>
          <div>Evolutions</div>
        </div>
      </div>

      {agent.role === 'GENERATOR' && agent.context.length > 0 && (
         <div className="mt-2 text-[10px] text-gray-400 truncate border-t pt-2 border-gray-100 dark:border-gray-700">
           Last: "{agent.context[agent.context.length - 1]}"
         </div>
      )}
    </div>
  );
}
