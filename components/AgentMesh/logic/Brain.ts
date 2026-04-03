import { Brain, ACEContext, Message, AgentGene } from '../types';
import { AlphaEvolve } from './AlphaEvolve';

/**
 * A Rule-Based Brain that simulates decision making.
 * In a real scenario, this would call an LLM API.
 * Here, it uses heuristics based on "Genes" (parameters).
 */
export class RuleBasedBrain implements Brain {

  /**
   * Processes an input message and returns an output message (or null if silent).
   */
  async process(input: Message, context: ACEContext): Promise<Message | null> {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100));

    // Basic Logic:
    // 1. If it's a system message, ignore (or process differently).
    if (input.type === 'System') return null;

    // 2. Decide whether to respond based on genes? (Not implemented here, assumed caller decides or always responds)
    // For this simulation, we will generate a response.

    const output: Message = {
      id: crypto.randomUUID(),
      from: 'UNKNOWN', // Will be filled by Agent
      to: 'ALL',
      what: "Analyze and respond",
      where: "Global Mesh",
      how: "Heuristic evaluation",
      reasoning: this.generateReasoning(),
      timestamp: Date.now(),
      type: 'Output',
    };

    return output;
  }

  /**
   * Evolves the brain's genes using AlphaEvolve.
   */
  evolve(genes: Record<string, AgentGene>): Record<string, AgentGene> {
    return AlphaEvolve.evolve(genes);
  }

  /**
   * Simple heuristic reasoning generator.
   */
  private generateReasoning(): string {
    const responses = [
      "I see. Interesting point. Action taken to align with current goal.",
      "Could you elaborate on that? Need more context for execution.",
      "I agree with the premise. Proceeding with standard operation.",
      "That contradicts my data. Requesting verification.",
      "Acknowledged. Monitoring for further inputs.",
      "Processing... optimization required. Initiating background analysis.",
      "Let's iterate on this. Feedback loop engaged.",
      "Analyzing context... waiting for next state change.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
