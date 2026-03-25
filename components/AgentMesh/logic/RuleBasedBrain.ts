import { Brain, Message, AgentContext } from "./Types";

/**
 * Strategy pattern for decision making.
 * Decouples logic and response throttling from Agent state.
 */
export class RuleBasedBrain implements Brain {
  async decide(message: Message, context: AgentContext): Promise<Message | null> {
    // Avoid responding to own messages
    if (message.senderId === context.id) {
      return null;
    }

    // Determine basic response strategy based on agent role
    const chanceToRespond = context.parameters.responsiveness || 0.5;

    // Simulate recursive response throttling / basic chance
    if (Math.random() > chanceToRespond) {
      return null; // Throttle: decided not to respond
    }

    // Extract evolved parameters for reasoning payload
    const paramString = Object.entries(context.parameters)
      .map(([k, v]) => `${k}:${typeof v === 'number' ? v.toFixed(3) : v}`)
      .join(', ');

    // Generate output explicitly defining what, where, how, reasoning
    const response: Message = {
      id: crypto.randomUUID(),
      senderId: context.id,
      timestamp: Date.now(),
      what: `Analyze and optimize the outcome of [${message.what}] according to ${context.role} standards.`,
      where: `In relation to ${message.where} handled by ${context.name}.`,
      how: `Apply domain-specific rules based on ${context.role} and AlphaEvolve mutation context.`,
      reasoning: `Ensure the output aligns with continuous optimization, security, performance, style, documentation, cleanliness, and order. Evolved state: [${paramString}].`,
    };

    return response;
  }
}
