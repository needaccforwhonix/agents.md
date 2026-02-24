export type AgentRole = 'GENERATOR' | 'REVIEWER' | 'OPTIMIZER';

export type AgentStatus = 'IDLE' | 'PROCESSING' | 'WAITING';

export interface AgentParameters {
  creativity: number; // 0.0 to 1.0
  strictness: number; // 0.0 to 1.0
  efficiency: number; // 0.0 to 1.0
  learningRate: number; // 0.0 to 1.0
}

export interface AgentStats {
  messagesProcessed: number;
  successfulGenerations: number;
  evolutions: number;
}

export interface Agent {
  id: string;
  role: AgentRole;
  status: AgentStatus;
  context: string[];
  parameters: AgentParameters;
  stats: AgentStats;
  color: string;
}

export type MessageType = 'PROMPT' | 'FEEDBACK' | 'PARAM_UPDATE';

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  type: MessageType;
  timestamp: number;
  data?: any; // For structured data like scores or parameter updates
}

export interface LogEntry {
  id: string;
  timestamp: number;
  agentId?: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
}

export interface SimulationState {
  agents: Agent[];
  messages: Message[]; // In-flight or recently processed messages
  logs: LogEntry[];
  tickCount: number;
  isRunning: boolean;
  bestPrompt: string;
  bestScore: number;
}
