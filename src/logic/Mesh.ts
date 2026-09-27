import { Agent } from "./Agent";
import { Message } from "./Types";

/**
 * The core Agent Mesh broadcast architecture.
 * Manages continuous parallel processing. Everything gets its own a2a agent,
 * and all agents receive every output as input.
 */
import { countTokens } from "./ACE";
import { extractCodeBlocks, analyzeCodeBlock } from "./AST";

/**
 * Validates individual message fields against token limits.
 */
function validateMessageBounds(message: Message, limit: number = 4000): boolean {
  if (countTokens(message.what) > limit) return false;
  if (countTokens(message.where) > limit) return false;
  if (countTokens(message.how) > limit) return false;
  if (countTokens(message.reasoning || "") > limit) return false;
  return true;
}

export class Mesh {
  private agents: Map<string, Agent> = new Map();
  private messages: Message[] = [];

  // Throttle limit to prevent out of control infinite broadcast chains
  private messageLimit: number;

  constructor(messageLimit: number = 100) {
    this.messageLimit = messageLimit;
  }

  public registerAgent(agent: Agent) {
    if (!agent || !agent.context || !agent.context.id) {
      throw new Error("Invalid Agent: Agent and Agent Context must be fully defined.");
    }
    this.agents.set(agent.context.id, agent);
  }

  /**
   * Broadcast a single message to all registered agents asynchronously.
   * If an agent produces a response, that response is then broadcast.
   * Uses a queue-based loop to prevent OOM errors.
   */
  public async broadcast(initialMessage: Message): Promise<void> {
    if (!initialMessage) {
      throw new Error("Invalid Message: Message cannot be null or undefined.");
    }

    const queue: Message[] = [initialMessage];
    let processedCount = 0;
    const agentsList = Array.from(this.agents.values());

    while (queue.length > 0) {
      if (processedCount >= this.messageLimit) {
        break;
      }

      const message = queue.shift();
      if (!message) continue;

      this.messages.push(message);
      processedCount++;

      if (!validateMessageBounds(message)) {
        continue;
      }

      // AST Demock Validation against the full message content
      const combinedContent = `${message.what} ${message.where} ${message.how} ${message.reasoning || ""}`;
      const blocks = extractCodeBlocks(combinedContent);
      let isMessageValid = true;
      for (const block of blocks) {
        const analysis = analyzeCodeBlock(block);
        if (!analysis.isValid) {
          isMessageValid = false;
          break; // Skip processing this message further
        }
      }

      if (!isMessageValid) continue;

      // All agents receive every output as input asynchronously
      const responsePromises = agentsList.map(async (agent) => {
        try {
          const response = await agent.receiveMessage(message);
          if (response) {
            // If agent decides to react, queue their output to be processed
            queue.push(response);
          }
        } catch {
          // Agent failure intentionally swallowed in mesh broadcast to prevent crashing the simulation
        }
      });

      // Await all parallel agent reactions for the current message
      await Promise.allSettled(responsePromises);
    }
  }

  public getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  public getMessages(): Message[] {
    return this.messages;
  }

  /**
   * Helper to set messages directly (useful for hydration).
   */
  public setMessages(messages: Message[]): void {
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid Messages: Messages must be a valid array.");
    }
    this.messages = messages;
  }
}
