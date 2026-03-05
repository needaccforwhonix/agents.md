import { Message } from "./Types";

/**
 * Agentic Context Engineering (ACE) Module
 * Handles message history bounding and simulated token counting to prevent memory leaks and UI freezes.
 */

// Simulated token counting based on string length (approximate)
export function countTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Ensure the message history stays within a token limit
export function boundHistory(history: Message[], maxTokens: number = 2000): Message[] {
  let currentTokens = 0;
  const boundedHistory: Message[] = [];

  // Iterate backwards to keep the most recent messages
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    const msgString = `${msg.what} ${msg.where} ${msg.how}`;
    const tokens = countTokens(msgString);

    if (currentTokens + tokens <= maxTokens) {
      boundedHistory.unshift(msg);
      currentTokens += tokens;
    } else {
      break;
    }
  }

  return boundedHistory;
}
