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
  reasoning: string;
}

export interface AgentParameters {
  responsiveness?: number;
  generation?: number;
  analyticalDepth?: number;
  contextRetention?: number;
  [key: string]: number | undefined;
}

export interface AgentContext {
  id: string;
  name: string;
  role: string;
  history: Message[];
  parameters: AgentParameters;
}

export interface Brain {
  decide(message: Message, context: AgentContext): Promise<Message | null>;
}
