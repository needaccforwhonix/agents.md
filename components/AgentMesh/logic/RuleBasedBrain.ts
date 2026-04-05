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

    let roleSpecificHow = `Apply Agentic Context Engineering for token bounds and AlphaEvolve for parameter mutation. Use specialized ${context.role} strategies to proactively enhance Security, Performance, Style, Documentation, Cleanliness, and Order.`;

    switch (context.role) {
      case "System Security Analyst":
        roleSpecificHow = "Perform vulnerability scanning, dependency checks, and sanitize all agent inputs.";
        break;
      case "System Performance Optimizer":
        roleSpecificHow = "Profile AST bounds, analyze memory limits, and optimize simulation bottlenecks.";
        break;
      case "System Style Enforcer":
        roleSpecificHow = "Enforce strict TypeScript types and maintain explicit directory layout conventions.";
        break;
      case "System Documenter":
        roleSpecificHow = "Generate dynamic README summaries and inline code documentation reflecting evolved states.";
        break;
      case "System Cleanliness & Order":
        roleSpecificHow = "Identify obsolete mock patterns, remove unused imports, and consolidate logic.";
        break;
      case "Prompt & Logic Optimizer":
        roleSpecificHow = "Analyze prompt effectiveness, refine ACE logic, and tune alphaEvolve parameters.";
        break;
      case "System Developer":
        roleSpecificHow = "Implement core logic enhancements, integrate cross-domain features, and address AST demock requirements.";
        break;
      case "Root Directory Manager":
      case "Components Manager":
      case "Pages Manager":
      case "Scripts Manager":
      case "Github Config Manager":
      case "Public Assets Manager":
      case "Styles Manager":
      case "Test Directory Manager":
        roleSpecificHow = "Ensure directory-specific constraints are met, validate related AST patterns, and coordinate updates within the respective domain.";
        break;
    }

    // Generate output explicitly defining what, where, how, reasoning
    const response: Message = {
      id: crypto.randomUUID(),
      senderId: context.id,
      timestamp: Date.now(),
      what: `I have analyzed [${message.what}] in the domain of ${context.role}. I will now refactor and implement the next continuous optimizations focusing on explicitly answering what, where, and how.`,
      where: `Location: Executing within the ${context.name} domain, reacting to output originating from ${message.where}.`,
      how: roleSpecificHow,
      reasoning: `Reasoning: To ensure asynchronous, parallel improvements are non-destructive and additive, while optimizing Security, Performance, Style, Documentation, Cleanliness, Order, and Prompt/Logic execution. I am utilizing Agentic Context Engineering and AlphaEvolve. Evolved Parameters: ${stringifiedParameters}`,
    };

    return response;
  }
}
