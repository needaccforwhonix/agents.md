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

<<<<<<< HEAD
export interface AgentParameters {
  responsiveness?: number;
  generation?: number;
  analyticalDepth?: number;
  contextRetention?: number;
  [key: string]: number | undefined;
}

=======
>>>>>>> legacy_remote/main
export interface AgentContext {
  id: string;
  name: string;
  role: string;
  history: Message[];
<<<<<<< HEAD
  parameters: AgentParameters;
=======
  parameters: Record<string, any>;
>>>>>>> legacy_remote/main
}

export interface Brain {
  decide(message: Message, context: AgentContext): Promise<Message | null>;
}
