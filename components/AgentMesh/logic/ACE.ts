import { Message } from "./Types";

/**
 * Agentic Context Engineering (ACE) Module
 * Handles message history bounding and simulated token counting to prevent memory leaks and UI freezes.
 */

// Simulated token counting based on string length (approximate)
export function countTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Check bounds for individual message properties to avoid massive payloads
export function validateMessageBounds(msg: Message, maxFieldTokens: number = 500): boolean {
  if (countTokens(msg.what) > maxFieldTokens) return false;
  if (countTokens(msg.where) > maxFieldTokens) return false;
  if (countTokens(msg.how) > maxFieldTokens) return false;
  if (msg.reasoning && countTokens(msg.reasoning) > maxFieldTokens) return false;
  return true;
}

// Ensure the message history stays within a token limit
export function boundHistory(history: Message[], maxTokens: number = 2000): Message[] {
  let currentTokens = 0;
  const boundedHistory: Message[] = [];

  // Iterate backwards to keep the most recent messages
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];

    // Calculate total tokens for this message
    const msgTokens = countTokens(msg.what) +
                      countTokens(msg.where) +
                      countTokens(msg.how) +
                      (msg.reasoning ? countTokens(msg.reasoning) : 0);

    // If a single message exceeds maxTokens by itself, we might optionally discard it
    // or keep it if it's the absolute only message we can fit (edge case)
    if (currentTokens + msgTokens <= maxTokens) {
      boundedHistory.unshift(msg);
      currentTokens += msgTokens;
    } else {
      // If we haven't added ANY messages yet, add this one to prevent 0-history stall,
      // but otherwise, break to respect the token bounds.
      if (boundedHistory.length === 0) {
        boundedHistory.unshift(msg);
      }
      break;
    }
  }

  return boundedHistory;
}
