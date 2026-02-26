import React from 'react';

interface ControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onAddAgent: () => void;
  agentCount: number;
}

export const Controls: React.FC<ControlsProps> = ({ isRunning, onStart, onStop, onAddAgent, agentCount }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700 w-full justify-between">
      <div className="flex gap-4">
        <button
          onClick={isRunning ? onStop : onStart}
          className={`px-4 py-2 rounded font-bold transition-colors shadow-lg ${
            isRunning
              ? 'bg-red-600 hover:bg-red-700 text-white border border-red-500'
              : 'bg-green-600 hover:bg-green-700 text-white border border-green-500'
          }`}
        >
          {isRunning ? 'STOP' : 'START'}
        </button>

        <button
          onClick={onAddAgent}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-colors shadow-lg border border-blue-500"
        >
          Add Agent
        </button>
      </div>

      <div className="text-gray-400 text-sm bg-gray-900 px-3 py-1 rounded border border-gray-700">
        Active Agents: <span className="font-mono text-white font-bold ml-1">{agentCount}</span>
      </div>
    </div>
  );
};
