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

    // Ensure all Outputs as Inputs are explicitly and dynamically defining what, where, how, reasoning
    const evolvedParamsStr = Object.keys(context.parameters).length > 0
      ? `evolved parameters (gen: ${context.parameters.generation?.toFixed(2) || 1})`
      : `strategies`;

    const response: Message = {
      id: crypto.randomUUID(),
      senderId: context.id,
      timestamp: Date.now(),
      what: `Continuously evolve and optimize the outcome of: [${message.what}]`,
      where: `Agent2Agent Context: ${context.name} applying domain rules to [${message.where}]`,
      how: `Utilizing Agentic Context Engineering, AlphaEvolve, and ${context.role} ${evolvedParamsStr} asynchronously`,
      reasoning: `As an autonomous ${context.role} A2A agent, I received this output as input. I must react to ensure continuous parallel development, focusing strictly on optimization, security, performance, style, documentation, cleanliness, and order.`,
    };

    return response;
  }
}
