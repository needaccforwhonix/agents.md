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

    // Consider context deeper for reasoning
    const historyCount = context.history.length;
    const historyNote = historyCount > 10 ? "based on extensive historical context" : "based on initial observation";

    // Generate output explicitly defining what, where, how, why
    const response: Message = {
      id: crypto.randomUUID(),
      senderId: context.id,
      timestamp: Date.now(),
      what: `Analyze and optimize the outcome of [${message.what}] for ${context.role}`,
      where: `Context: ${context.name} processing task from ${message.where}`,
      how: `Using specialized ${context.role} strategies and evolved parameters (gen: ${context.parameters.generation || 1})`,
      why: `To ensure alignment with ${context.role} standards, ${historyNote}, responding to: ${message.why || 'system directive'}`,
    };

    return response;
  }
}
