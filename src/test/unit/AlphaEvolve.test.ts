import { describe, it, expect } from 'vitest';
import { alphaEvolve } from '../../logic/AlphaEvolve';
import { AgentParameters } from '../../logic/Types';

describe('AlphaEvolve', () => {
  it('should evolve numeric parameters slightly', () => {
    const params: AgentParameters = { responsiveness: 0.5, analyticalDepth: 1.0 };
    const evolved = alphaEvolve(params, 0.1);

    expect(evolved.responsiveness).not.toBe(params.responsiveness);
    expect(evolved.analyticalDepth).not.toBe(params.analyticalDepth);

    // Check if variations are within expected bounds
    expect(evolved.responsiveness).toBeGreaterThanOrEqual(0);
    expect(evolved.responsiveness).toBeLessThanOrEqual(0.5 + (0.5 * 0.1));
    expect(evolved.analyticalDepth).toBeGreaterThanOrEqual(0);
    expect(evolved.analyticalDepth).toBeLessThanOrEqual(1.0 + (1.0 * 0.1));
  });

  it('should increment the generation parameter if present', () => {
    const params: AgentParameters = { generation: 5 };
    const evolved = alphaEvolve(params, 0.1);

    // AlphaEvolve adds random variation to numbers. Since generation is a number, it will be varied first, THEN incremented.
    // In AlphaEvolve.ts, `evolved[key] = Math.max(0, evolved[key] + variation)`.
    // Then `evolved.generation += 1`.

    // Thus it won't be EXACTLY params.generation + 1. It will be (params.generation + random_variation) + 1.
    expect(evolved.generation).toBeGreaterThan(params.generation!);
  });

  it('should not mutate string parameters', () => {
    const params: AgentParameters = { someString: 'hello' as any };
    const evolved = alphaEvolve(params);

    expect(evolved.someString).toBe('hello');
  });

  it('should clamp negative values to 0', () => {
    const params: AgentParameters = { responsiveness: 0.0001 };
    // By using a large negative mutation simulation (though math.random is random, we can just ensure it doesn't drop below zero)
    const evolved = alphaEvolve(params, 100);

    expect(evolved.responsiveness).toBeGreaterThanOrEqual(0);
  });
});
