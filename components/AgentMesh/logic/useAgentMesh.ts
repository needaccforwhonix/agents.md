import { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Agent, AgentConfig, AgentAction } from '../types';
import { AgentLogic } from './AgentLogic';

export function useAgentMesh() {
  const [messages, setMessages] = useState<Message[]>([]);
  // We use state just to trigger re-renders, but main source of truth for logic is refs to avoid stale closures
  const [agents, setAgents] = useState<AgentLogic[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const agentsRef = useRef<AgentLogic[]>([]);
  const queueRef = useRef<Message[]>([]);
  const processingRef = useRef(false);

  // Force update helper to refresh UI when internal agent state changes
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    if (queueRef.current.length === 0) return;

    processingRef.current = true;

    // Process all pending messages one by one to maintain causality
    while (queueRef.current.length > 0) {
        const msg = queueRef.current[0]; // Peek
        // We shift after processing? Or before?
        // Better before to avoid infinite loop if error.
        queueRef.current.shift();

        if (msg) {
            // Dispatch to all agents in parallel
            await Promise.all(agentsRef.current.map(async (agent) => {
                // Don't process own messages
                if (agent.id === msg.senderId) return;

                try {
                    const action = await agent.process(msg);
                    if (action.type === 'SPEAK') {
                        // Push response to queue
                        const newMsg: Message = {
                            id: Math.random().toString(36).substr(2, 9),
                            senderId: agent.id,
                            senderName: agent.config.name,
                            content: action.content,
                            timestamp: Date.now(),
                            type: 'broadcast'
                        };
                        queueRef.current.push(newMsg);
                        setMessages(prev => [...prev, newMsg]);
                    }
                } catch (e) {
                    console.error(`Agent ${agent.config.name} error:`, e);
                }
            }));

            forceUpdate();
        }
    }

    processingRef.current = false;
  }, []); // Stable dependency

  // External broadcast function
  const broadcast = useCallback((content: string, senderId: string, senderName: string) => {
      const msg: Message = {
          id: Math.random().toString(36).substr(2, 9),
          senderId,
          senderName,
          content,
          timestamp: Date.now(),
          type: senderId === 'system' ? 'system' : 'broadcast'
      };
      setMessages(prev => [...prev, msg]);
      queueRef.current.push(msg);

      if (isRunning) {
          processQueue();
      }
  }, [processQueue, isRunning]);

  const addAgent = useCallback((config: AgentConfig) => {
    const newAgent = new AgentLogic(config);
    agentsRef.current.push(newAgent);
    setAgents([...agentsRef.current]);
    broadcast(`${newAgent.config.name} has joined the mesh.`, 'system', 'System');
  }, [broadcast]);

  // Auto-process queue periodically
  useEffect(() => {
      if (!isRunning) return;
      const interval = setInterval(() => {
          processQueue();
      }, 500); // Check queue every 500ms
      return () => clearInterval(interval);
  }, [isRunning, processQueue]);

  return {
    messages,
    agents: agentsRef.current,
    addAgent,
    broadcast,
    isRunning,
    setIsRunning
  };
}
