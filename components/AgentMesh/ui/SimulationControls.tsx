import React from 'react';

interface SimulationControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void; // Not implemented yet but good for interface
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({ isRunning, onToggle, onReset }) => {
  return (
    <div className="flex gap-4 p-4 bg-white shadow-sm border rounded-lg mb-4 items-center">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="font-medium text-sm text-gray-700">
            {isRunning ? 'Simulation Running' : 'Simulation Paused'}
        </span>
      </div>

      <div className="h-6 w-px bg-gray-300 mx-2" />

      <button
        onClick={onToggle}
        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
          isRunning
            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
            : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
        }`}
      >
        {isRunning ? 'Pause' : 'Start'}
      </button>

       <button
        onClick={onReset}
        className="px-4 py-1.5 rounded-md text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
      >
        Reset
      </button>
    </div>
  );
};
