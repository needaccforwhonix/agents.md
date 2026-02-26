export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  type: 'broadcast' | 'direct' | 'system' | 'thought';
  metadata?: Record<string, any>;
}

export interface AgentTrait {
  name: string;
  value: number; // 0.0 to 1.0
  description: string;
}

export interface EvolutionState {
  generation: number;
  fitness: number;
  traits: Record<string, AgentTrait>;
}

export interface AgentContext {
  summary: string;
  relevantHistory: Message[];
  currentFocus: string | null;
  tokenCount: number;
}

export interface AgentConfig {
  id: string;
  name: string;
  systemPrompt: string;
  initialTraits: Record<string, AgentTrait>;
}

export interface BrainState {
  isThinking: boolean;
  lastThought?: string;
}

export type AgentAction =
  | { type: 'SPEAK'; content: string }
  | { type: 'THINK'; content: string }
  | { type: 'IGNORE' }
  | { type: 'MUTATE'; traits: Record<string, number> };

export interface Agent {
  id: string;
  config: AgentConfig;
  evolution: EvolutionState;
  context: AgentContext;
  brainState: BrainState;

  // Methods
  process(message: Message): Promise<AgentAction>;
  evolve(feedback: number): void;
}
