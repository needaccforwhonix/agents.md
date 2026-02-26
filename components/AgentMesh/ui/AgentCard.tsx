import React from 'react';
import { Agent, AgentTrait } from '../types';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const { config, evolution, brainState, context } = agent;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 flex flex-col gap-3 min-w-[300px]">
      <div className="flex justify-between items-center border-b pb-2 border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{config.name}</h3>
        <span className={`px-2 py-0.5 rounded text-xs font-mono ${brainState.isThinking ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
          {brainState.isThinking ? 'THINKING' : 'IDLE'}
        </span>
      </div>

      {/* Evolution / Traits */}
      <div className="space-y-1">
        <div className="text-xs font-semibold text-gray-500 uppercase">AlphaEvolve Traits (Gen {evolution.generation})</div>
        {Object.entries(evolution.traits).map(([key, trait]) => (
          <div key={key} className="flex items-center gap-2 text-sm">
            <span className="w-24 truncate text-gray-600 dark:text-gray-400">{trait.name}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${trait.value * 100}%` }}
              />
            </div>
            <span className="text-xs w-8 text-right">{trait.value.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Context / ACE */}
      <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded text-xs font-mono text-gray-600 dark:text-gray-400 overflow-hidden h-16 relative">
        <div className="absolute top-0 right-0 bg-gray-200 px-1 rounded-bl text-[10px]">ACE Context</div>
        <p className="whitespace-pre-wrap">{context.summary}</p>
        <p className="mt-1 text-gray-400">Tokens: ~{Math.floor(context.tokenCount)}</p>
      </div>

      {/* Last Thought/Action */}
      {brainState.lastThought && (
        <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm italic text-gray-500">"{brainState.lastThought}"</p>
        </div>
      )}
    </div>
  );
}
