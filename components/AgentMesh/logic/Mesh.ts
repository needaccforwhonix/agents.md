import { Agent } from "./Agent";
import { Message } from "./Types";

/**
 * The core Agent Mesh broadcast architecture.
 * Manages continuous parallel processing. Everything gets its own a2a agent,
 * and all agents receive every output as input.
 */
import { countTokens } from "./ACE";

/**
 * Validates individual message fields against token limits.
 */
function validateMessageBounds(message: Message, limit: number = 2000): boolean {
  if (countTokens(message.what) > limit) return false;
  if (countTokens(message.where) > limit) return false;
  if (countTokens(message.how) > limit) return false;
  if (countTokens(message.reasoning || "") > limit) return false;
  return true;
}

export class Mesh {
  private agents: Map<string, Agent> = new Map();
  private messages: Message[] = [];

  // A queue for processing messages to prevent deep recursion causing OOM
  private messageQueue: Message[] = [];
  private isProcessing: boolean = false;

  // Throttle limit to prevent out of control infinite broadcast chains
  private messageLimit: number;

  constructor(messageLimit: number = 100) {
    this.messageLimit = messageLimit;
  }

  public registerAgent(agent: Agent) {
    this.agents.set(agent.context.id, agent);
  }

  /**
   * Enqueue a message to be broadcast to all registered agents.
   * Processes the queue sequentially to avoid stack overflows.
   */
  public async broadcast(message: Message): Promise<void> {
    this.messageQueue.push(message);
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.messageQueue.length > 0) {
      if (this.messages.length >= this.messageLimit) {
        console.warn(`Mesh broadcast limit reached. Terminating branch.`);
        this.messageQueue = []; // Clear the queue
        break;
      }

      const message = this.messageQueue.shift();
      if (!message) continue;

      this.messages.push(message);

      if (!validateMessageBounds(message)) {
        console.warn(`Message [${message.id}] rejected by Mesh: Field token limit exceeded.`);
        continue;
      }

      // All agents receive every output as input asynchronously
      const responsePromises = Array.from(this.agents.values()).map(async (agent) => {
        try {
          const response = await agent.receiveMessage(message);
          if (response) {
            // If agent decides to react, queue their output recursively as a new input
            this.messageQueue.push(response);
          }
        } catch (err) {
          console.error(`Agent [${agent.context.name}] failed to process message.`, err);
        }
      });

      // Await all parallel agent reactions for the current message
      await Promise.allSettled(responsePromises);
    }

    this.isProcessing = false;
  }

  public getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  public getMessages(): Message[] {
    return this.messages;
  }
}
