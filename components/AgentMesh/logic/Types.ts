export interface Message {
  id: string;
  senderId: string;
  timestamp: number;
  what: string;
  where: string;
  how: string;
  reasoning?: string;
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

export interface ASTAnalysisResultV2 {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  summary: {
    errors: number;
    warnings: number;
    suggestions: number;
  };
}
