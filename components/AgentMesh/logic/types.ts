export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  topics: string[];
}

export interface AgentParams {
  curiosity: number;      // 0-1: Likelihood to explore new topics
  responsiveness: number; // 0-1: Likelihood to respond to messages
  creativity: number;     // 0-1: Variance in output content
  aggression: number;     // 0-1: Tone of the response (simulated)
  learningRate: number;   // 0-1: Speed of parameter mutation
  energy: number;         // 0-100: Resource for actions
}

export interface AgentContext {
  tokenUsage: number;
  maxTokens: number;
  summaries: string[];
}

export interface AgentState {
  id: string;
  name: string;
  params: AgentParams;
  history: Message[];
  status: 'idle' | 'processing' | 'cooldown';
  lastActionTime: number;
  context: AgentContext;
}
