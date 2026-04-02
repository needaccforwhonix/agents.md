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

    // Serialize context parameters to show evolution in the reasoning field
    const stringifiedParameters = JSON.stringify(context.parameters);

    // Generate output explicitly defining what, where, how, reasoning
    const response: Message = {
      id: crypto.randomUUID(),
      senderId: context.id,
      timestamp: Date.now(),
      what: `Analyze, validate, and optimize the outcome of [${message.what}] adhering to strict additive-only policies`,
      where: `Context: ${context.name} processing task from ${message.where}`,
      how: `Using specialized ${context.role} strategies, Demock validations, and evolved parameters`,
      reasoning: `As a ${context.role}, I must ensure output strictly aligns with continuous optimization, zero-deletion additive policies, AST Demock standards, ACE boundaries, CI/CD pipeline integrity, and E2E validation. Evolved Parameters: ${stringifiedParameters}`,
    };

    return response;
  }
}
