import React, { useEffect, useRef } from 'react';
import { Message } from '../logic/types';

interface ActivityLogProps {
  messages: Message[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Messages are stored newest-first in the logic, so we reverse to display chronological top-to-bottom
  const displayMessages = [...messages].reverse();

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg h-96 flex flex-col">
      <div className="p-3 border-b border-gray-700 font-bold text-gray-300">Activity Log</div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2" ref={scrollRef}>
        {displayMessages.length === 0 ? (
          <div className="text-gray-500 italic">No activity yet...</div>
        ) : (
          displayMessages.map((msg) => (
            <div key={msg.id} className="text-sm border-l-2 border-blue-500 pl-2 py-1 mb-2 bg-gray-800/50 rounded-r">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span className="font-bold text-blue-400">{msg.senderName}</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="text-gray-300">{msg.content}</div>
              {msg.topics.length > 0 && (
                 <div className="flex gap-1 mt-1 flex-wrap">
                   {msg.topics.map(t => (
                     <span key={t} className="text-[10px] bg-gray-700 px-1 rounded text-gray-400 border border-gray-600">{t}</span>
                   ))}
                 </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
