/**
 * AlphaEvolve Algorithm
 * A simple mutation function to evolve agent parameters over time within a broadcast mesh.
 */
export function alphaEvolve(parameters: Record<string, any>, mutationRate: number = 0.1): Record<string, any> {
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
