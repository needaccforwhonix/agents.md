import React, { useEffect, useRef } from 'react';
import { Message } from '../types';

interface BroadcastLogProps {
  messages: Message[];
}

export function BroadcastLog({ messages }: BroadcastLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden"
    >
      <div className="bg-gray-100 dark:bg-gray-900/50 p-2 border-b border-gray-200 dark:border-gray-700 font-bold text-sm text-gray-500 uppercase tracking-wide">
        Global Broadcast Log (Input/Output Stream)
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 italic py-10">No messages yet. Start the simulation.</div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 p-3 rounded-lg border text-sm ${
              msg.type === 'system'
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
            }`}
          >
            <div className="flex justify-between items-center text-xs opacity-70">
              <span className="font-mono font-bold uppercase">{msg.senderName}</span>
              <span className="font-mono">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>

            <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200">
              {msg.content}
            </div>

            {/* Simulated Technical Info */}
            <div className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 font-mono flex gap-3 border-t border-gray-200 dark:border-gray-600 pt-1">
              <span>ID: {msg.id}</span>
              <span>TYPE: {msg.type.toUpperCase()}</span>
              <span>TOKENS: {msg.content.length / 4}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
