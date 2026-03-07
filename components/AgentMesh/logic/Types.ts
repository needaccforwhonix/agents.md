export interface Message {
  id: string;
  senderId: string;
  timestamp: number;
  // Intent: what is desired
  what: string;
  // Location: where is it desired
  where: string;
  // Action: how is it desired
  how: string;
  // Reasoning: why is it desired
  why: string;
}

export interface AgentContext {
  id: string;
  name: string;
  role: string;
  history: Message[];
  parameters: Record<string, any>;
}

export interface Brain {
  decide(message: Message, context: AgentContext): Promise<Message | null>;
}
