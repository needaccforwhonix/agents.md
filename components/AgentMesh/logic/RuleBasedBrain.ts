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
      what: `Analyze, optimize, and iterate on [${message.what}] utilizing Agentic Context Engineering (ACE) to guide precise prompt logic and code generation for ongoing asynchronous parallel continuous development.`,
      where: `Target domain: [${context.name}] responding to origin: [${message.where}]. Scope applies fully across the agent mesh architecture.`,
      how: `Apply specific ${context.role} strategies combined with continuous alphaEvolve algorithm mutations. Ensure strictly 'democked' outputs, explicit AST purity, and continuous recursive improvements.`,
      reasoning: `As a ${context.role}, I must actively align with robust security, high performance, strict style rules, thorough documentation, cleanliness, and meticulous order. This ensures the asynchronous mesh continually evolves and stays up-to-date. Evolved Parameters: ${stringifiedParameters}`,
    };

    return response;
  }
}
