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
    // Customize the "how" and "reasoning" specifically based on the agent's role
    let specificHow = `Using specialized ${context.role} strategies and evolved parameters`;
    let specificReasoning = `As a ${context.role}, I must ensure the output aligns with overall system stability and continuous optimization.`;

    if (context.role.toLowerCase().includes("security")) {
      specificHow = "Reviewing implementation for vulnerabilities, cross-site scripting risks, and validating input boundaries";
      specificReasoning = "Security must be inherently built-in rather than bolted on later. Ensuring no zero-day flaws enter the codebase.";
    } else if (context.role.toLowerCase().includes("performance")) {
      specificHow = "Profiling memory usage, time complexity, and identifying potential bottlenecks";
      specificReasoning = "To prevent recursive infinite loops and UI freezes by bounding operations tightly.";
    } else if (context.role.toLowerCase().includes("cleanliness")) {
      specificHow = "Running Demock AST validation to eliminate dummy variables and empty blocks";
      specificReasoning = "Cleanliness and order strictly forbid dead code or mock data leaking into production environments.";
    }

    const response: Message = {
      id: crypto.randomUUID(),
      senderId: context.id,
      timestamp: Date.now(),
      what: `Analyze and optimize the outcome of [${message.what}]`,
      where: `Context: ${context.name} processing task from ${message.where}`,
      how: specificHow,
      reasoning: specificReasoning,
    };

    return response;
  }
}
