import { describe, it, expect } from "vitest";
import { alphaEvolve } from "../../logic/AlphaEvolve";
import { AgentParameters } from "../../logic/Types";

describe("AlphaEvolve Module", () => {
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

  it("should skip non-number parameters during mutation", () => {
    const params: AgentParameters = {
      creativity: 0.5,
      someStringParam: "test" as unknown as number // testing non-number
    };

    const evolved = alphaEvolve(params, 0.5);
    expect(evolved.someStringParam).toBe("test");
  });

  it('should return empty object for null or undefined input', () => {
    expect(alphaEvolve(null as unknown as AgentParameters)).toEqual({});
    expect(alphaEvolve(undefined as unknown as AgentParameters)).toEqual({});
  });

  it('should handle negative generation correctly', () => {
    const params: AgentParameters = {
      creativity: 0.5,
      generation: -1
    };

    const evolved = alphaEvolve(params, 0.1);
    expect(evolved.generation).toBe(0);
  });

  it('should clamp values at 0 even for extreme mutation rates', () => {
    const params: AgentParameters = {
      creativity: 0.5,
      detailOrientation: 0.5
    };

    const evolved = alphaEvolve(params, 1000.0); // Extreme mutation
    expect(evolved.creativity).toBeGreaterThanOrEqual(0);
    expect(evolved.detailOrientation).toBeGreaterThanOrEqual(0);
  });

  it('should handle NaN gracefully', () => {
    const params: AgentParameters = {
      creativity: NaN
    };

    const evolved = alphaEvolve(params, 0.1);
    expect(Number.isNaN(evolved.creativity)).toBe(true);
  });

  it('should handle Infinity gracefully', () => {
    const params: AgentParameters = {
      creativity: Infinity
    };

    const evolved = alphaEvolve(params, 0.1);
    expect(evolved.creativity).toBe(Infinity);
  });
});
