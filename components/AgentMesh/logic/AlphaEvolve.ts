import { AgentGene, EvolutionConfig } from '../types';

/**
 * AlphaEvolve Algorithm
 * Handles the mutation and evolution of agent "genes" (parameters).
 * Based on simulated genetic algorithms.
 */
export class AlphaEvolve {

  /**
   * Evolves a set of genes based on configuration.
   * Returns a new set of genes (does not mutate in place).
   */
  public static evolve(
    genes: Record<string, AgentGene>,
    config: EvolutionConfig = { mutationChance: 0.1, mutationRange: 0.05 }
  ): Record<string, AgentGene> {
    const newGenes: Record<string, AgentGene> = {};

    for (const [key, gene] of Object.entries(genes)) {
      newGenes[key] = this.mutateGene(gene, config);
    }

    return newGenes;
  }

  /**
   * Mutates a single gene.
   */
  private static mutateGene(gene: AgentGene, config: EvolutionConfig): AgentGene {
    // Check if mutation should occur based on gene's specific rate AND global chance
    const shouldMutate = Math.random() < (gene.mutationRate * config.mutationChance);

    if (!shouldMutate) {
      return { ...gene };
    }

    // Mutate value
    let newValue = gene.value + (Math.random() * 2 - 1) * config.mutationRange;

    // Clamp between 0.0 and 1.0
    newValue = Math.max(0, Math.min(1, newValue));

    return {
      ...gene,
      value: newValue,
    };
  }

  /**
   * Crossover (Recombination) - Not used in single-agent evolution but useful for sexual reproduction simulation.
   * Takes two gene sets and returns a mixed set.
   */
  public static crossover(
    parentA: Record<string, AgentGene>,
    parentB: Record<string, AgentGene>
  ): Record<string, AgentGene> {
    const childGenes: Record<string, AgentGene> = {};
    const keys = Object.keys(parentA);

    for (const key of keys) {
        // 50/50 chance to inherit from A or B
        childGenes[key] = Math.random() > 0.5 ? { ...parentA[key] } : { ...parentB[key] };
    }

    return childGenes;
  }
}
