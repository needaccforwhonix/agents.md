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

    const responseContent = this.generateResponse(input.content);

    const output: Message = {
      id: crypto.randomUUID(),
      from: 'UNKNOWN', // Will be filled by Agent
      to: 'ALL',
      content: responseContent,
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
   * Simple heuristic response generator.
   */
  private generateResponse(inputContent: string): string {
    const responses = [
      "I see. Interesting point.",
      "Could you elaborate on that?",
      "I agree with the premise.",
      "That contradicts my data.",
      "Acknowledged.",
      "Processing... optimization required.",
      "Let's iterate on this.",
      "Analyzing context...",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
