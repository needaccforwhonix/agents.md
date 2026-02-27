import { Agent } from './Agent';
import { Message } from '../types';

/**
 * The Agent Mesh (Event Bus).
 * Connects all agents. Broadcasts all outputs to all inputs.
 */
export class Mesh {
  private agents: Map<string, Agent> = new Map();
  private listeners: ((message: Message) => void)[] = [];

  public register(agent: Agent): void {
    this.agents.set(agent.state.id, agent);
  }

  public unregister(agentId: string): void {
    this.agents.delete(agentId);
  }

  /**
   * Broadcasts a message to all agents.
   */
  public broadcast(message: Message): void {
    // 1. Notify external listeners (UI, Logger)
    this.listeners.forEach((listener) => listener(message));

    // 2. Deliver to all agents
    this.agents.forEach((agent) => {
      agent.receive(message);
    });
  }

  /**
   * Subscribe to mesh events (for UI visualization).
   */
  public subscribe(callback: (message: Message) => void): void {
    this.listeners.push(callback);
  }

  public getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  public getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }
}
