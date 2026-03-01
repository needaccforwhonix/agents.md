import { useEffect, useRef } from 'react';
import { AgentState, Message } from '../logic/types';

interface MessageLogProps {
  messages: Message[];
  agents: AgentState[];
}

export const MessageLog: React.FC<MessageLogProps> = ({ messages, agents }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAgentName = (id: string) => {
    if (id === 'system') return 'SYSTEM (Genesis)';
    const agent = agents.find(a => a.id === id);
    return agent ? agent.name : 'Unknown';
  };

  return (
    <div className="w-full flex flex-col h-[500px] border border-gray-700 rounded-lg overflow-hidden bg-gray-900 mt-8">
      <div className="bg-gray-800 p-3 border-b border-gray-700 font-bold text-white shadow-sm flex justify-between items-center">
        <h3>A2A Mesh Network Log</h3>
        <span className="text-xs font-mono bg-gray-700 px-2 py-1 rounded text-gray-300">
          Total Messages: {messages.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 italic">
            Waiting for genesis broadcast...
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="bg-gray-800 rounded p-3 border border-gray-700 text-sm">
              <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                <span className="font-bold text-blue-400">{getAgentName(msg.senderId)}</span>
                <span className="text-xs text-gray-500 font-mono">
                  {new Date(msg.timestamp).toISOString().split('T')[1].replace('Z', '')}
                </span>
              </div>

              <div className="space-y-2 mt-2 font-mono text-xs">
                <div className="grid grid-cols-[60px_1fr] gap-2">
                  <span className="text-gray-500 font-bold">WHAT:</span>
                  <span className="text-green-300">{msg.what}</span>
                </div>
                <div className="grid grid-cols-[60px_1fr] gap-2">
                  <span className="text-gray-500 font-bold">WHERE:</span>
                  <span className="text-yellow-300">{msg.where}</span>
                </div>
                <div className="grid grid-cols-[60px_1fr] gap-2">
                  <span className="text-gray-500 font-bold">HOW:</span>
                  <span className="text-purple-300">{msg.how}</span>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
