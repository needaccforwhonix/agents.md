import { describe, it, expect } from 'vitest';
import { alphaEvolve } from '../../logic/AlphaEvolve';
import { AgentParameters } from '../../logic/Types';

describe('AlphaEvolve Unit Tests', () => {
  it('should evolve numeric parameters slightly and non-negatively', () => {
    const params: AgentParameters = {
      responsiveness: 0.5,
      analyticalDepth: 0.8,
    };

    const evolved = alphaEvolve(params, 0.1);

    expect(evolved.responsiveness).toBeGreaterThanOrEqual(0);
    expect(evolved.analyticalDepth).toBeGreaterThanOrEqual(0);
    expect(evolved.responsiveness).not.toBeUndefined();
    expect(evolved.analyticalDepth).not.toBeUndefined();
  });

  it('should increment generation if it exists and maintain it as integer if not mutated by loop', () => {
    const params: AgentParameters = {
      generation: 1,
      responsiveness: 0.5,
    };

    const evolved = alphaEvolve(params, 0.1);
    expect(evolved.generation).toBeGreaterThanOrEqual(2 - 1 * 0.1);
    expect(evolved.generation).toBeLessThanOrEqual(2 + 1 * 0.1);
  });

  it('should leave non-numeric parameters unchanged', () => {
    const params: AgentParameters = {
      stringParam: 'test' as unknown as number,
      responsiveness: 0.5,
    };

    const evolved = alphaEvolve(params, 0.1);
    expect(evolved['stringParam']).toBe('test');
  });

  it('should handle zero parameters gracefully', () => {
    const params: AgentParameters = {};
    const evolved = alphaEvolve(params, 0.1);
    expect(Object.keys(evolved).length).toBe(0);
  });
});
