/**
 * AlphaEvolve Algorithm
 * A simple mutation function to evolve agent parameters over time within a broadcast mesh.
 * Includes simulated annealing concept via generation-based mutation decay.
 */
export function alphaEvolve(parameters: Record<string, any>, baseMutationRate: number = 0.1): Record<string, any> {
  const evolved = { ...parameters };

  // Calculate generation-based decay (Simulated Annealing)
  // Higher generation means lower mutation rate to stabilize
  const currentGeneration = evolved.generation || 1;
  // Decay formula: rate = baseRate * (1 / sqrt(generation))
  const effectiveMutationRate = baseMutationRate * (1 / Math.sqrt(currentGeneration));

  for (const key in evolved) {
    if (typeof evolved[key] === 'number' && key !== 'generation') {
      // Apply slight random mutation based on effective rate
      const variation = evolved[key] * effectiveMutationRate * (Math.random() * 2 - 1);
      evolved[key] = Math.max(0, evolved[key] + variation); // Clamp to non-negative
    }
  }

  // Increment generation counter if it exists
  if (evolved.generation !== undefined) {
    evolved.generation += 1;
  }

  return evolved;
}
