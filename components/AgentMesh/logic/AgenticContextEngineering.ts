import { Message, Context, AgentConfig } from './types';

export class AgenticContextEngineering {
  /**
   * Tracks and simulates token counts to bound memory and context window.
   */
  static estimateTokenCount(text: string): number {
    // Very simple heuristic: 1 token ~= 4 chars
    return Math.ceil(text.length / 4);
  }

  static getMessageTokenCount(message: Message): number {
    return this.estimateTokenCount(message.what) +
           this.estimateTokenCount(message.where) +
           this.estimateTokenCount(message.how);
  }

  /**
   * Applies recursive response throttling and bounds history.
   * Keeps context within the maxMemoryTokens limit.
   */
  static boundContext(context: Context, config: AgentConfig): Context {
    let currentTokens = 0;
    const boundedMessages: Message[] = [];

    // Iterate backwards to keep the most recent messages
    for (let i = context.recentMessages.length - 1; i >= 0; i--) {
      const msg = context.recentMessages[i];
      const tokens = this.getMessageTokenCount(msg);

      if (currentTokens + tokens > config.maxMemoryTokens) {
        // Break early if adding the message exceeds limit
        break;
      }

      boundedMessages.unshift(msg);
      currentTokens += tokens;
    }

    return {
      recentMessages: boundedMessages,
      tokenCount: currentTokens,
    };
  }

  /**
   * Summarizes older messages if context gets too long.
   */
  static summarizeAndBound(context: Context, config: AgentConfig): Context {
      // In a real system, we might ask an LLM to summarize.
      // For simulation, we just truncate via bounding.
      return this.boundContext(context, config);
  }
}
