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
      what: `Analyze, optimize, and improve the prompt and logic implementation of [${message.what}] focusing on Security, Performance, Style, Documentation, Cleanliness, Order, and Optimization`,
      where: `Context: ${context.name} processing task asynchronously from ${message.where} in the agent2agent mesh architecture`,
      how: `Using specialized ${context.role} strategies, Agentic Context Engineering (ACE), and AlphaEvolve algorithms to develop code in parallel continuously`,
      reasoning: `As a ${context.role}, I must ensure the output aligns with continuous parallel asynchronous evolution across Security, Performance, Style, Documentation, Cleanliness, Order, and Optimization. I must ensure asynchronous, parallel improvements are non-destructive and additive. Evolved Parameters: ${stringifiedParameters}`,
    };

    return response;
  }
}
