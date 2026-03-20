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

    // Generate output explicitly defining what, where, how, reasoning
    const response: Message = {
      id: crypto.randomUUID(),
      senderId: context.id,
      timestamp: Date.now(),
      what: `Analyze, refactor, and continuously optimize the outcome of [${message.what}]`,
      where: `Context: ${context.name} processing task from ${message.where}`,
      how: `Using specialized ${context.role} strategies, Agentic Context Engineering (ACE), and AlphaEvolve algorithms with full reasoning`,
      reasoning: `As a ${context.role}, I must ensure the asynchronous output aligns with continuous prompt/logic optimization, security, performance, style, documentation, cleanliness, and order.`,
    };

    return response;
  }
}
