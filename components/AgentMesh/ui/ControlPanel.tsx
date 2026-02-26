import React, { useState } from 'react';

interface ControlPanelProps {
  isRunning: boolean;
  onToggle: () => void;
  onAddAgent: (name: string, traits: any) => void;
  onBroadcast: (msg: string) => void;
}

export function ControlPanel({ isRunning, onToggle, onAddAgent, onBroadcast }: ControlPanelProps) {
  const [manualInput, setManualInput] = useState('');
  const [newAgentName, setNewAgentName] = useState('');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    onBroadcast(manualInput);
    setManualInput('');
  };

  const handleAddAgent = () => {
    if (!newAgentName.trim()) return;
    onAddAgent(newAgentName, {
      assertiveness: { name: 'Assertiveness', value: Math.random(), description: 'Tendency to speak up' },
      verbosity: { name: 'Verbosity', value: Math.random(), description: 'Length of responses' },
      creativity: { name: 'Creativity', value: Math.random(), description: 'Novelty of ideas' }
    });
    setNewAgentName('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col gap-4">
      <div className="flex justify-between items-center border-b pb-2 border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Control Panel</h2>
        <button
          onClick={onToggle}
          className={`px-4 py-2 rounded text-white font-bold transition-colors ${
            isRunning
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isRunning ? 'STOP SIMULATION' : 'START SIMULATION'}
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newAgentName}
          onChange={(e) => setNewAgentName(e.target.value)}
          placeholder="New Agent Name..."
          className="flex-1 px-3 py-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
        />
        <button
          onClick={handleAddAgent}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Agent
        </button>
      </div>

      <form onSubmit={handleBroadcast} className="flex gap-2 mt-2">
        <input
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="Inject Broadcast Message (Manual Input)..."
          className="flex-1 px-3 py-2 border rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 font-mono"
        />
        <button
          type="submit"
          className="bg-gray-800 text-white dark:bg-gray-600 px-4 py-2 rounded hover:opacity-80"
        >
          Send
        </button>
      </form>
    </div>
  );
}
