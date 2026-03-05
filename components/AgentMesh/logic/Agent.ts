import { AgentContext, Brain, Message } from "./Types";
import { boundHistory } from "./ACE";
import { alphaEvolve } from "./AlphaEvolve";

/**
 * Autonomous a2a Agent in the Mesh.
 * Receives every output as input asynchronously, utilizes full context, and evolves.
 */
export class Agent {
  public context: AgentContext;
  private brain: Brain;

  constructor(id: string, name: string, role: string, brain: Brain, parameters: Record<string, any> = {}) {
    this.context = {
      id,
      name,
      role,
      history: [],
      parameters: {
        responsiveness: 0.6,
        generation: 1,
        ...parameters,
      },
    };
    this.brain = brain;
  }

  /**
   * Called by the Mesh when a new message is broadcast.
   * Modifies context and uses Brain to optionally decide on a response.
   */
  async receiveMessage(message: Message): Promise<Message | null> {
    // 1. Add to context history
    this.context.history.push(message);

    // 2. Bound history using Agentic Context Engineering to prevent memory leaks
    this.context.history = boundHistory(this.context.history, 4000);

    // 3. Evolve parameters slowly per message received
    this.context.parameters = alphaEvolve(this.context.parameters, 0.05);

    // 4. Delegate decision to the Strategy Brain
    const response = await this.brain.decide(message, this.context);

    if (response) {
      // Add own response to history before returning
      this.context.history.push(response);
      this.context.history = boundHistory(this.context.history, 4000);
    }

    return response;
  }
}
