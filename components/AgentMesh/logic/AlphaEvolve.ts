<<<<<<< HEAD
import { AgentParameters } from "./Types";

=======
>>>>>>> legacy_remote/main
/**
 * AlphaEvolve Algorithm
 * A simple mutation function to evolve agent parameters over time within a broadcast mesh.
 */
<<<<<<< HEAD
export function alphaEvolve(parameters: AgentParameters, mutationRate: number = 0.1): AgentParameters {
=======
export function alphaEvolve(parameters: Record<string, any>, mutationRate: number = 0.1): Record<string, any> {
>>>>>>> legacy_remote/main
  const evolved = { ...parameters };

  for (const key in evolved) {
    if (typeof evolved[key] === 'number') {
      // Apply slight random mutation based on mutationRate
      const variation = evolved[key] * mutationRate * (Math.random() * 2 - 1);
      evolved[key] = Math.max(0, evolved[key] + variation); // Clamp to non-negative
    }
  }

  // Increment generation counter if it exists
  if (evolved.generation !== undefined) {
    evolved.generation += 1;
  }

  return evolved;
}
