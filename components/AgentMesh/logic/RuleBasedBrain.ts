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

    // Generate output explicitly defining what, where, how, and reasoning
    const response: Message = {
      id: crypto.randomUUID(),
      senderId: context.id,
      timestamp: Date.now(),
      what: `Analyze and optimize the outcome of [${message.what}] focusing on ${context.role} aspects`,
      where: `Context: ${context.name} processing task from [${message.where}]`,
      how: `Applying specialized ${context.role} strategies, agentic context engineering, and alphaEvolve (gen ${context.parameters.generation || 1})`,
      reasoning: `As a ${context.role}, it is critical to address the implications of [${message.what}] to ensure continuous improvement in security, performance, style, documentation, cleanliness, order, and overall optimization.`,
    };

    return response;
  }
}
