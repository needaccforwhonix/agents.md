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

  it("should slightly mutate number parameters and increment generation", () => {
    const params: AgentParameters = {
      creativity: 0.5,
      detailOrientation: 0.5,
      generation: 1
    };

    const evolved = alphaEvolve(params, 0.1);

    expect(Math.round(evolved.generation!)).toBe(2);
    expect(evolved.creativity).toBeGreaterThanOrEqual(0);
    expect(evolved.detailOrientation).toBeGreaterThanOrEqual(0);
  });

  it("should safely handle params without generation", () => {
    const params: AgentParameters = {
      creativity: 0.5,
      detailOrientation: 0.5
    };

    const evolved = alphaEvolve(params);
    expect(evolved.generation).toBeUndefined();
  });

  it("should clamp values at 0", () => {
    const params: AgentParameters = {
      creativity: 0.0,
      detailOrientation: 0.0
    };

    const evolved = alphaEvolve(params, 1.0); // high mutation rate
    expect(evolved.creativity).toBeGreaterThanOrEqual(0);
  });
});
