import { AgentState } from '../logic/types';
import { AgentCard } from './AgentCard';

interface AgentListProps {
  agents: AgentState[];
}

export const AgentList: React.FC<AgentListProps> = ({ agents }) => {
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 text-white">Active Agents</h2>
      {agents.length === 0 ? (
        <p className="text-gray-500 italic">No agents initialized. Start the simulation.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
};
