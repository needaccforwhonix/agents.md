export interface AgentMessage {
  id: string;
  senderId: string;
  timestamp: number;
  what: string; // Intent
  where: string; // Location
  how: string; // Action
  rawContent: string;
  tokenCount?: number;
}

export interface AgentState {
  id: string;
  name: string;
  memory: AgentMessage[];
  status: 'idle' | 'processing' | 'error';
  parameters: {
    temperature: number;
    creativity: number;
    focus: number;
  };
}

export interface SimulationConfig {
  maxHistorySize: number;
  throttleMs: number;
  maxConsecutiveResponses: number;
}
