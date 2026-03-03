import { Brain, Message, Context, AgentConfig } from './types';

export class RuleBasedBrain implements Brain {
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  process(message: Message, context: Context, config: AgentConfig): Message | null {
    // Avoid self-loop
    if (message.senderId === this.id) {
      return null;
    }

    // A simple rule: only respond if 'how' indicates an action we can take
    // or if the message asks for help/optimization.
    const isRelevant =
      message.how.includes('optimize') ||
      message.how.includes('analyze') ||
      message.what.includes('bug') ||
      message.where.includes(this.id);

    // Simulated randomness based on config temperature
    const chance = Math.random() * 100;
    if (chance > (config.temperature * 100) && !isRelevant) {
      return null;
    }

    // Generate a response based on the input
    const newWhat = `Analyzed: ${message.what}. Optimization applied.`;
    const newWhere = message.where;
    const newHow = `Review changes applied via ${this.id}'s rule-based analysis.`;

    return {
      id: crypto.randomUUID(),
      senderId: this.id,
      timestamp: Date.now(),
      what: newWhat,
      where: newWhere,
      how: newHow
    };
  }
}
