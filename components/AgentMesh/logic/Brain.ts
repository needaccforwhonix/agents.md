import { Message, AgentState } from './types';

export interface Brain {
  shouldRespond(message: Message, state: AgentState): boolean;
  process(message: Message, state: AgentState): Promise<Message | null>;
}
