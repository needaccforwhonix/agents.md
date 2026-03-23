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
    const evolvedParams = JSON.stringify(context.parameters);
    const response: Message = {
      id: crypto.randomUUID(),
      senderId: context.id,
      timestamp: Date.now(),
      what: `Propose advanced optimizations, refactoring, or additions for [${message.what}] based on my role.`,
      where: `Targeting [${message.where}] within the context of ${context.name}'s responsibilities.`,
      how: `By applying specialized ${context.role} strategies, validating against code bounds, and generating actionable code or documentation.`,
      reasoning: `As a ${context.role}, continuous optimization is required. My evolved generation (${context.parameters.generation || 1}) and parameters (${evolvedParams}) drive me to refine security, performance, style, cleanliness, and order.`,
    };

    return response;
  }
}
