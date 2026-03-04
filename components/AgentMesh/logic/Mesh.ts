import { Agent } from "./Agent";
import { Message } from "./Types";

/**
 * The core Agent Mesh broadcast architecture.
 * Manages continuous parallel processing. Everything gets its own a2a agent,
 * and all agents receive every output as input.
 */
export class Mesh {
  private agents: Map<string, Agent> = new Map();
  private messages: Message[] = [];

  // Throttle limit to prevent out of control infinite broadcast chains
  private messageLimit: number = 100;

  public registerAgent(agent: Agent) {
    this.agents.set(agent.context.id, agent);
  }

  /**
   * Broadcast a single message to all registered agents asynchronously.
   * If an agent produces a response, that response is then broadcast.
   */
  public async broadcast(message: Message, depth: number = 0): Promise<void> {
    if (depth > this.messageLimit) {
      console.warn(`Mesh broadcast limit reached. Terminating branch.`);
      return;
    }

    this.messages.push(message);

    // All agents receive every output as input asynchronously
    const responsePromises = Array.from(this.agents.values()).map(async (agent) => {
      try {
        const response = await agent.receiveMessage(message);
        if (response) {
          // If agent decides to react, broadcast their output recursively as a new input
          await this.broadcast(response, depth + 1);
        }
      } catch (err) {
        console.error(`Agent [${agent.context.name}] failed to process message.`, err);
      }
    });

    // Await all parallel agent reactions
    await Promise.allSettled(responsePromises);
  }

  public getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  public getMessages(): Message[] {
    return this.messages;
  }
}
