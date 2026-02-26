import { Message, AgentContext } from '../types';

export class ContextManager {
  private history: Message[] = [];
  private maxHistory: number = 50; // Keep last 50 messages
  private summary: string = "Initial state.";
  private keywords: Set<string>;

  constructor(initialKeywords: string[] = []) {
    this.keywords = new Set(initialKeywords.map(k => k.toLowerCase()));
  }

  public addMessage(message: Message): void {
    this.history.push(message);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      // In a real system, we would summarize here.
      // For now, we just truncate.
    }
  }

  public getRelevantContext(query: string | null): AgentContext {
    // Simple relevance filtering:
    // If query is null, return last 5 messages.
    // If query is present, return messages containing keywords from query.

    let relevant = this.history;

    if (query) {
      const queryKeywords = query.toLowerCase().split(/\s+/);
      relevant = this.history.filter(msg =>
        queryKeywords.some(k => msg.content.toLowerCase().includes(k))
      );
    }

    // Always include the last 3 messages for immediate context
    const recent = this.history.slice(-3);
    const combined = Array.from(new Set([...relevant, ...recent]))
      .sort((a, b) => a.timestamp - b.timestamp);

    return {
      summary: this.summary,
      relevantHistory: combined,
      currentFocus: query,
      tokenCount: combined.reduce((acc, msg) => acc + msg.content.length, 0) / 4 // Crude approximation
    };
  }

  public updateSummary(newSummary: string): void {
    this.summary = newSummary;
  }
}
