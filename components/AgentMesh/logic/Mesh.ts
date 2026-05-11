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

  // Throttle limit to prevent out of control infinite broadcast chains
  private messageLimit: number;

  constructor(messageLimit: number = 100) {
    this.messageLimit = messageLimit;
  }

  public registerAgent(agent: Agent) {
    this.agents.set(agent.context.id, agent);
  }

  /**
   * Broadcast a single message to all registered agents asynchronously.
   * If an agent produces a response, that response is then broadcast.
   * Uses a queue-based loop to prevent OOM errors.
   */
  public async broadcast(initialMessage: Message): Promise<void> {
    const queue: Message[] = [initialMessage];
    let processedCount = 0;

    while (queue.length > 0) {
      if (processedCount >= this.messageLimit) {
        console.warn(`Mesh broadcast total message limit reached (${this.messageLimit}). Terminating branch.`);
        break;
      }

      const message = queue.shift();
      if (!message) continue;

      this.messages.push(message);
      processedCount++;

      if (!validateMessageBounds(message)) {
        console.warn(`Message [${message.id}] rejected by Mesh: Field token limit exceeded.`);
        continue;
      }

      // AST Demock Validation against the full message content
      const combinedContent = `${message.what} ${message.where} ${message.how} ${message.reasoning || ""}`;
      const blocks = extractCodeBlocks(combinedContent);
      let isMessageValid = true;
      for (const block of blocks) {
        const analysis = analyzeCodeBlock(block);
        if (!analysis.isValid) {
          console.warn(`Message [${message.id}] rejected by Mesh due to AST Demock validation: ${analysis.errors.join(", ")}`);
          isMessageValid = false;
          break; // Skip processing this message further
        }
      }

      if (!isMessageValid) continue;

      // All agents receive every output as input asynchronously
      const responsePromises = Array.from(this.agents.values()).map(async (agent) => {
        try {
          const response = await agent.receiveMessage(message);
          if (response) {
            // If agent decides to react, queue their output to be processed
            queue.push(response);
          }
        } catch (err) {
          console.error(`Agent [${agent.context.name}] failed to process message.`, err);
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
}
