export interface Message {
  id: string;
  senderId: string;
  timestamp: number;
  what: string;   // Intent/Content
  where: string;  // Location/Target
  how: string;    // Action/Method
}

export interface AgentConfig {
  temperature: number;
  mutationRate: number;
  maxMemoryTokens: number;
}

export interface AgentState {
  memoryUsage: number;
  messageCount: number;
  isActive: boolean;
}

export interface Context {
  recentMessages: Message[];
  tokenCount: number;
}

export interface Brain {
  process(message: Message, context: Context, config: AgentConfig): Message | null;
}
