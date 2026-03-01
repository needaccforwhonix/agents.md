import { AgentState } from '../logic/types';

interface AgentCardProps {
  agent: AgentState;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return (
    <div className="border border-gray-700 rounded p-4 bg-gray-800 shadow-md">
      <h3 className="font-bold text-lg text-white mb-2">{agent.name}</h3>
      <p className="text-sm text-gray-400 mb-1" title="Simulated Token Count from Context Engineering">
        Tokens Processed: <span className="text-gray-200">{agent.tokenCount.toLocaleString()}</span>
      </p>

      <div className="mt-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AlphaEvolve Params</h4>
        <div className="grid grid-cols-3 gap-2 mt-1 text-xs">
          <div className="bg-gray-900 p-1 rounded text-center">
            <span className="block text-gray-500">α (alpha)</span>
            <span className="text-green-400">{agent.params.alpha.toFixed(3)}</span>
          </div>
          <div className="bg-gray-900 p-1 rounded text-center">
            <span className="block text-gray-500">β (beta)</span>
            <span className="text-blue-400">{agent.params.beta.toFixed(3)}</span>
          </div>
          <div className="bg-gray-900 p-1 rounded text-center">
            <span className="block text-gray-500">γ (gamma)</span>
            <span className="text-purple-400">{agent.params.gamma.toFixed(3)}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600 truncate">
        ID: {agent.id}
      </div>
    </div>
  );
};
