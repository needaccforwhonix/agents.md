import React, { useMemo } from 'react';
import AgentNode from './AgentNode';
import { Agent, SimulationState } from './types';

interface MeshCanvasProps {
  state: SimulationState;
}

export default function MeshCanvas({ state }: MeshCanvasProps) {
  const generator = state.agents.find(a => a.role === 'GENERATOR');
  const reviewer = state.agents.find(a => a.role === 'REVIEWER');
  const optimizer = state.agents.find(a => a.role === 'OPTIMIZER');

  // Simple hardcoded positions for the triangle layout
  // Generator: Bottom Left
  // Reviewer: Bottom Right
  // Optimizer: Top Center

  return (
    <div className="relative w-full h-[500px] bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 shadow-inner overflow-hidden">

      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      {/* Connection Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
          </marker>
        </defs>

        {/* Generator -> Reviewer */}
        <line x1="20%" y1="70%" x2="80%" y2="70%" stroke="#e5e7eb" strokeWidth="2" markerEnd="url(#arrowhead)" />

        {/* Reviewer -> Optimizer */}
        <line x1="80%" y1="70%" x2="50%" y2="20%" stroke="#e5e7eb" strokeWidth="2" markerEnd="url(#arrowhead)" />

        {/* Optimizer -> Generator */}
        <line x1="50%" y1="20%" x2="20%" y2="70%" stroke="#e5e7eb" strokeWidth="2" markerEnd="url(#arrowhead)" />
      </svg>

      {/* Agents */}
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2">
        {optimizer && <AgentNode agent={optimizer} />}
      </div>

      <div className="absolute bottom-[20%] left-[20%] -translate-x-1/2 -translate-y-1/2">
        {generator && <AgentNode agent={generator} />}
      </div>

      <div className="absolute bottom-[20%] right-[20%] translate-x-1/2 -translate-y-1/2">
        {reviewer && <AgentNode agent={reviewer} />}
      </div>

      {/* Active Message Indicators (Flying dots) */}
      {state.messages.map(msg => {
        // Very rough approximation of position based on from/to
        // In a real app we'd use proper coordinates
        const isGenToRev = msg.fromId === generator?.id && msg.toId === reviewer?.id;
        const isRevToOpt = msg.fromId === reviewer?.id && msg.toId === optimizer?.id;
        const isOptToGen = msg.fromId === optimizer?.id && msg.toId === generator?.id;

        let animationClass = '';
        if (isGenToRev) animationClass = 'animate-slide-right';
        if (isRevToOpt) animationClass = 'animate-slide-up-left';
        if (isOptToGen) animationClass = 'animate-slide-down-left';

        return (
            <div
                key={msg.id}
                className={`absolute w-4 h-4 rounded-full bg-blue-500 shadow-lg z-10 transition-all duration-1000 ${animationClass}`}
                style={{
                    left: isGenToRev ? '20%' : (isRevToOpt ? '80%' : '50%'),
                    top: isGenToRev ? '70%' : (isRevToOpt ? '70%' : '20%'),
                    // We can't easily animate strictly along the path with CSS classes without complex keyframes matching the coordinates.
                    // For now, let's just show them at the 'from' position to indicate activity.
                }}
            >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            </div>
        );
      })}

      <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-black/80 p-2 rounded text-xs backdrop-blur-sm border border-gray-100 dark:border-gray-800">
        <div className="font-bold mb-1">Mesh Statistics</div>
        <div>Best Score: <span className="text-green-600 font-mono">{state.bestScore.toFixed(1)}</span></div>
        <div className="max-w-xs truncate text-gray-500 mt-1" title={state.bestPrompt}>"{state.bestPrompt}"</div>
      </div>

    </div>
  );
}
