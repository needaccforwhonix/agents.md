import { Message } from './types';
import { Agent } from './Agent';

export class AgentMesh {
  private agents: Map<string, Agent> = new Map();
  private history: Message[] = [];

  // Throttle constants
  private maxDepth = 5;
  private maxHistorySize = 100;
  private messageLimit = 100; // max tokens per message

  private validateMessageBounds(message: Message): boolean {
    // simple token estimation
    const estimate = (text: string) => Math.ceil((text || '').length / 4);
    const totalTokens = estimate(message.what) + estimate(message.where) + estimate(message.how) + estimate(message.reasoning);
    return totalTokens <= this.messageLimit;
  }

  public register(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  public unregister(agentId: string): void {
    this.agents.delete(agentId);
  }

  /**
   * Broadcasts a message to all agents.
   * Uses recursive depth tracking to throttle infinite loops and UI freezes.
   */
  public broadcast(message: Message, depth = 0): void {
    if (!this.validateMessageBounds(message)) {
      console.warn(`[AgentMesh] Message from ${message.senderId} exceeds token limit. Dropping.`);
      return;
    }

    if (depth >= this.maxDepth) {
      console.warn(`[AgentMesh] Max broadcast depth ${this.maxDepth} reached. Throttling.`);
      return;
    }

    // Bound global history
    if (this.history.length >= this.maxHistorySize) {
      this.history.shift();
    }
    this.history.push(message);

    // Collect responses synchronously or asynchronously
    const nextMessages: Message[] = [];

    this.agents.forEach((agent) => {
      try {
        const response = agent.receive(message);
        if (response) {
          nextMessages.push(response);
        }
      } catch (err) {
        console.error(`[AgentMesh] Agent ${agent.id} failed to process message:`, err);
      }
    });

    // Recursively broadcast the responses
    nextMessages.forEach((nextMsg) => {
      // Simulate asynchronous parallel broadcasting
      setTimeout(() => {
        this.broadcast(nextMsg, depth + 1);
      }, 0);
    });
  }

  public getHistory(): Message[] {
    return [...this.history];
  }

  public getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }
}
