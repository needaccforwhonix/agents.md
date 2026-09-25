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
});
