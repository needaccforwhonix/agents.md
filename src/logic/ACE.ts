import { Message } from "./Types";

/**
 * Agentic Context Engineering (ACE) Module
 * Handles message history bounding and simulated token counting to prevent memory leaks and UI freezes.
 */

// Simulated token counting based on string length (approximate)
export function countTokens(text: string): number {
  if (text === undefined || text === null) return 0;
  if (typeof text !== 'string') {
    throw new Error("Invalid input: text must be a string");
  }
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// Ensure the message history stays within a token limit
export function boundHistory(history: Message[], maxTokens: number = 2000): Message[] {
  if (!history || !Array.isArray(history)) {
    throw new Error("History must be a valid array");
  }
  let currentTokens = 0;
  const boundedHistory: Message[] = [];

  // Iterate backwards to keep the most recent messages
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    const msgString = `${msg.what} ${msg.where} ${msg.how} ${msg.reasoning || ""}`;
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
