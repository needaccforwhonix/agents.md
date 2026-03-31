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

    // Extract recent historical context to ground the response
    const recentHistory = context.history.slice(-2).map(m => m.what).join(" | ");

    // Dynamically align response to the agent's role and explicitly focus on core priorities
    const what = `Optimize and implement improvements for [${message.what}] based on ${context.role} specific strategies`;
    const where = `Analyzing the effect on ${message.where} while reviewing the context: ${context.name}. Historical context: ${recentHistory}`;
    const how = `Utilize Agentic Context Engineering and AlphaEvolve algorithms, deeply applying ${context.role} principles to enforce security, performance, style, documentation, cleanliness, and order`;
    const reasoning = `As ${context.role}, my core reasoning is to continuously evolve the architecture. It is strictly required that optimizations address security, performance, style, documentation, cleanliness, and order. Evolved Parameters: ${stringifiedParameters}`;

    // Generate output explicitly defining what, where, how, reasoning
    const response: Message = {
      id: crypto.randomUUID(),
      senderId: context.id,
      timestamp: Date.now(),
      what,
      where,
      how,
      reasoning,
    };

    return response;
  }
}
