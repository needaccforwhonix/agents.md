export interface Message {
  id: string;
  sender: string;
  intent: string;  // What is wanted
  location: string; // Where it is wanted
  action: string;   // How it should be done
  content: string;  // Detailed content
  timestamp: number;
}

export interface BrainParams {
  creativity: number;
  analytical: number;
  decisiveness: number;
  mutationRate: number;
}

export interface AgentContext {
  id: string;
  name: string;
  history: Message[];
  tokenCount: number;
  params: BrainParams;
}

export interface AgentConfig {
  id: string;
  name: string;
  initialParams?: Partial<BrainParams>;
}
