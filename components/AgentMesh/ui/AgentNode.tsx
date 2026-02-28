import React from 'react';
import { AgentContext } from '../logic/types';

interface AgentNodeProps {
  context: AgentContext;
}

export const AgentNode: React.FC<AgentNodeProps> = ({ context }) => {
  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 m-2 bg-white dark:bg-gray-800 shadow-sm w-64 flex-shrink-0">
      <h3 className="text-lg font-bold mb-2 text-indigo-600 dark:text-indigo-400">{context.name}</h3>
      <div className="text-xs text-gray-500 mb-2">ID: {context.id.slice(0, 8)}...</div>

      <div className="mb-3">
        <div className="text-sm font-semibold mb-1">State:</div>
        <div className="text-xs">Context Size: {context.history.length} msgs</div>
        <div className="text-xs">Token Count: ~{context.tokenCount}</div>
      </div>

      <div>
        <div className="text-sm font-semibold mb-1">Brain Params (Evolving):</div>
        <ul className="text-xs space-y-1">
          <li>Creativity: {context.params.creativity.toFixed(2)}</li>
          <li>Analytical: {context.params.analytical.toFixed(2)}</li>
          <li>Decisiveness: {context.params.decisiveness.toFixed(2)}</li>
          <li>Mutation Rate: {context.params.mutationRate.toFixed(2)}</li>
        </ul>
      </div>
    </div>
  );
};
