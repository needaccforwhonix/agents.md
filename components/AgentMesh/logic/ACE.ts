import { ACEContext, Message, SimulationStats } from '../types';

/**
 * Agentic Context Engineering (ACE)
 * Manages the context window for an agent, ensuring that input/output
 * is formatted correctly and fits within token limits (simulated).
 */
export class ACE {
  private static MAX_SHORT_TERM_MEMORY = 10;
  private static TOKEN_COST_PER_CHAR = 0.25; // Approximate

  /**
   * Constructs the full prompt context for the agent's brain.
   */
  public static buildContext(
    identity: string,
    role: string,
    goal: string,
    memory: Message[],
    newInput: Message
  ): string {
    const systemPrompt = `You are ${identity}, a(n) ${role}. Your current goal is: "${goal}".`;
    const contextWindow = this.formatMemory(memory);
    const inputPrompt = `[INPUT from ${newInput.from}]: ${newInput.content}`;

    return `${systemPrompt}\n\nRunning Log:\n${contextWindow}\n\n${inputPrompt}\n\nRESPONSE:`;
  }

  /**
   * Formats the memory log into a readable string.
   */
  private static formatMemory(memory: Message[]): string {
    return memory
      .slice(-this.MAX_SHORT_TERM_MEMORY)
      .map((m) => `[${m.type}][${m.from}]: ${m.content}`)
      .join('\n');
  }

  /**
   * Simulates token counting for resource management.
   */
  public static countTokens(text: string): number {
    return Math.ceil(text.length * this.TOKEN_COST_PER_CHAR);
  }

  /**
   * Updates the context state with a new message, handling memory rotation.
   */
  public static updateContext(currentContext: ACEContext, newMessage: Message): ACEContext {
    const updatedShortTerm = [...currentContext.shortTermMemory, newMessage];

    // Simple sliding window for now. Ideally, this would summarize into longTermMemory.
    if (updatedShortTerm.length > this.MAX_SHORT_TERM_MEMORY) {
      const movedToLongTerm = updatedShortTerm.shift();
      if (movedToLongTerm) {
        currentContext.longTermMemory.push(movedToLongTerm);
      }
    }

    return {
      ...currentContext,
      shortTermMemory: updatedShortTerm,
      tokenCount: currentContext.tokenCount + this.countTokens(newMessage.content),
    };
  }
}
