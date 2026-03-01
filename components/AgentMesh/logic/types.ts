export interface Message {
  id: string;
  senderId: string;
  what: string;
  where: string;
  how: string;
  timestamp: number;
}

export interface AlphaEvolveParams {
  alpha: number;
  beta: number;
  gamma: number;
}

export interface AgentState {
  id: string;
  name: string;
  tokenCount: number;
  params: AlphaEvolveParams;
}

export interface Brain {
  processInput(message: Message, state: AgentState): Message | null;
}
