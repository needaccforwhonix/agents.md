export interface AgentId extends String {
  _brand: 'AgentId';
}

export type AgentRole = 'Observer' | 'Worker' | 'Critic' | 'Executor';

export interface AgentGene {
  trait: string;
  value: number; // 0.0 to 1.0
  mutationRate: number; // Probability of change
}

export interface AgentState {
  id: string;
  name: string;
  role: AgentRole;
  genes: Record<string, AgentGene>;
  energy: number; // Resource for processing
  age: number; // Iterations survived
  generation: number;
  status: 'Idle' | 'Thinking' | 'Acting' | 'Evolving' | 'Terminated';
}

export interface Message {
  id: string;
  from: string;
  to: string | 'ALL'; // Broadcast or Direct
  content: string;
  timestamp: number;
  type: 'Input' | 'Output' | 'System';
  meta?: Record<string, any>;
}

export interface ACEContext {
  shortTermMemory: Message[];
  longTermMemory: Message[]; // Summarized
  currentGoal: string;
  tokenCount: number;
}

export interface Brain {
  process(input: Message, context: ACEContext): Promise<Message | null>;
  evolve(genes: Record<string, AgentGene>): Record<string, AgentGene>;
}

export interface EvolutionConfig {
  mutationChance: number;
  mutationRange: number;
}

export interface SimulationStats {
  iteration: number;
  totalMessages: number;
  activeAgents: number;
}
