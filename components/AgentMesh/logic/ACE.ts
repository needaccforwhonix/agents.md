import { Message } from './types';

export class AgenticContextEngine {
  private history: Message[] = [];
  private tokenCount: number = 0;
  private readonly MAX_TOKENS: number;

  constructor(maxTokens: number = 8192) {
    this.MAX_TOKENS = maxTokens;
  }

  // Very simple simulated token counting: approx 4 chars per token
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private countMessageTokens(msg: Message): number {
    return this.estimateTokens(msg.intent + msg.location + msg.action + msg.content);
  }

  public addMessage(msg: Message): void {
    const msgTokens = this.countMessageTokens(msg);
    this.history.push(msg);
    this.tokenCount += msgTokens;

    this.pruneContext();
  }

  // Retain recent context, prune older messages if over limit
  private pruneContext(): void {
    while (this.tokenCount > this.MAX_TOKENS && this.history.length > 1) {
      const oldest = this.history.shift();
      if (oldest) {
        this.tokenCount -= this.countMessageTokens(oldest);
      }
    }
  }

  public getContext(): Message[] {
    return [...this.history];
  }

  public getTokenCount(): number {
    return this.tokenCount;
  }
}
