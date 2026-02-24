import React, { useEffect, useRef } from 'react';
import { LogEntry } from './types';

interface LogStreamProps {
  logs: LogEntry[];
}

const colorMap = {
  INFO: 'text-gray-500 dark:text-gray-400',
  SUCCESS: 'text-green-600 dark:text-green-400',
  WARNING: 'text-yellow-600 dark:text-yellow-400',
  ERROR: 'text-red-600 dark:text-red-400',
};

export default function LogStream({ logs }: LogStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full border rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700 px-4 py-2 font-semibold text-sm">
        Simulation Log
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs bg-gray-50/50 dark:bg-black/20"
      >
        {logs.length === 0 && <div className="text-gray-400 italic text-center p-4">Waiting for events...</div>}

        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <span className="text-gray-400 select-none whitespace-nowrap">
              {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
            </span>
            <span className={colorMap[log.type]}>
              {log.agentId && <span className="font-bold mr-1">[{log.agentId.substring(0,4)}]</span>}
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
