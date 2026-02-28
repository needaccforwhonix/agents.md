import React, { useRef, useEffect } from 'react';
import { Message } from '../logic/types';

interface MessageLogProps {
  messages: Message[];
}

export const MessageLog: React.FC<MessageLogProps> = ({ messages }) => {
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-200 dark:bg-gray-800 p-3 border-b border-gray-300 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200">
        Mesh Broadcast Channel
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-sm">
            <div className="flex justify-between items-center mb-2 border-b border-gray-100 dark:border-gray-700 pb-2">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{msg.sender === 'USER' ? 'User' : `Agent: ${msg.sender.slice(0, 8)}`}</span>
              <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="mb-1"><span className="font-semibold text-gray-600 dark:text-gray-300">Intent:</span> {msg.intent}</div>
            <div className="mb-1"><span className="font-semibold text-gray-600 dark:text-gray-300">Action:</span> {msg.action}</div>
            <div className="mb-1"><span className="font-semibold text-gray-600 dark:text-gray-300">Location:</span> {msg.location}</div>
            <div className="mt-2 text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-2 rounded">{msg.content}</div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">No messages in the mesh yet. Send one to start.</div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};
