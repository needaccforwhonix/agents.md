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

  it('should throw an error for null or undefined input', () => {
    expect(() => alphaEvolve(null as unknown as AgentParameters)).toThrow("Parameters cannot be null or undefined");
    expect(() => alphaEvolve(undefined as unknown as AgentParameters)).toThrow("Parameters cannot be null or undefined");
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

  it('should not mutate the generation parameter if it is set to 0, but it should still increment it by 1', () => {
    const params: AgentParameters = { generation: 0, analyticalDepth: 0.5 };
    const result = alphaEvolve(params, 0.1);
    expect(result.generation).toBe(1);
    // Since generation is skipped for random mutation, it explicitly skips the variation calculation
    // and then strictly increments by 1 at the end of alphaEvolve.
  });

  describe("AlphaEvolve edge cases", () => {
    it("should handle mutation rate of 0.0 with no changes to params", () => {
      const params: AgentParameters = {
        creativity: 0.5,
        detailOrientation: 0.7,
        generation: 1
      };
      const evolved = alphaEvolve(params, 0.0);
      expect(evolved.creativity).toBe(0.5);
      expect(evolved.detailOrientation).toBe(0.7);
      expect(evolved.generation).toBe(2);
    });

    it("should safely handle NaN mutation rate", () => {
      const params: AgentParameters = {
        creativity: 0.5,
        generation: 1
      };
      const evolved = alphaEvolve(params, NaN);
      expect(Number.isNaN(evolved.creativity)).toBe(true);
      expect(evolved.generation).toBe(2);
    });

    it("should safely handle Infinity and NaN within parameters", () => {
      const params: AgentParameters = {
        creativity: Infinity,
        detailOrientation: NaN,
        generation: 1
      };
      const evolved = alphaEvolve(params, 0.1);
      expect(typeof evolved.creativity).toBe('number');
      expect(Number.isNaN(evolved.detailOrientation)).toBe(true);
    });
  });

  describe('Table-Driven Logic Gate Verification', () => {
    const baseParams: AgentParameters = { creativity: 0.5, detailOrientation: 0.5, generation: 1 };

    const edgeCases = [
      {
        name: 'negative mutation rate',
        params: baseParams,
        rate: -0.5,
        verify: (evolved: AgentParameters) => {
          expect(evolved.generation).toBe(2);
          expect(evolved.creativity).toBeGreaterThanOrEqual(0);
        }
      },
      {
        name: 'exactly zero mutation rate',
        params: baseParams,
        rate: 0.0,
        verify: (evolved: AgentParameters) => {
          expect(evolved.generation).toBe(2);
          expect(evolved.creativity).toBe(0.5);
          expect(evolved.detailOrientation).toBe(0.5);
        }
      },
      {
        name: 'undefined mutation rate (uses default)',
        params: baseParams,
        rate: undefined,
        verify: (evolved: AgentParameters) => {
          expect(evolved.generation).toBe(2);
          expect(evolved.creativity).toBeDefined();
        }
      },
      {
        name: 'NaN mutation rate',
        params: baseParams,
        rate: NaN,
        verify: (evolved: AgentParameters) => {
          expect(evolved.generation).toBe(2);
          expect(Number.isNaN(evolved.creativity)).toBe(true);
        }
      }
    ];

    it.each(edgeCases)('should safely handle $name', ({ params, rate, verify }) => {
      const evolved = alphaEvolve(params, rate);
      verify(evolved);
    });
  });
});
