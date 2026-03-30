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
      what: `Analyze, refactor, and deeply optimize the outcome of [${message.what}] focusing strictly on ${context.role}. Identify code smells, security flaws, performance bottlenecks, or prompt inefficiencies and propose concrete fixes.`,
      where: `Target context for optimization: ${context.name} processing task from ${message.where} in AgentMesh. Applies to Security, Performance, Style, Cleanliness, Documentation, Order, and Prompt/Logic Optimization.`,
      how: `Apply cutting-edge Agentic Context Engineering (ACE) and AlphaEvolve algorithms. Use specialized ${context.role} strategies to strictly mutate variables, enforce type safety, eliminate dummy data patterns, ensure all functions have bodies, and enforce rigorous bounds checking.`,
      reasoning: `As an autonomous parallel agent with the role of ${context.role}, I must proactively push asynchronous evolution and maintain project purity without destructive actions. The current generation and state parameters must continuously mutate to seek maximum efficiency. AlphaEvolve Mutated Context Parameters: ${stringifiedParameters}. Context History length processed: ${context.history.length}.`,
    };

    return response;
  }
}
