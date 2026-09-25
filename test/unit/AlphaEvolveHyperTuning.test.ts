import { describe, it, expect } from 'vitest';
import { alphaEvolve } from '../../src/logic/AlphaEvolve';

describe('AlphaEvolve Hyperparameter Tuning', () => {
  it('should maintain stable parameters over 1000 generations with a low mutation rate', () => {
    let params = { generation: 1, analyticalDepth: 0.5, responsiveness: 0.5 };
    for (let i = 0; i < 1000; i++) {
      params = alphaEvolve(params, 0.01);
    }
    expect(params.generation).toBe(1001);
    expect(params.analyticalDepth).toBeGreaterThanOrEqual(0);
    expect(params.responsiveness).toBeGreaterThanOrEqual(0);
  });

  it('should show higher variance with a higher mutation rate', () => {
    // Math.random() in tests is unpredictable, so let's run more iterations or use a fixed seed.
    // Given we can't easily mock Math.random() without affecting everything, let's run a sufficient number of times
    let successCount = 0;

    // We try 10 times to get the stochastic behaviour to show higher variance for high mutation.
    for (let run = 0; run < 10; run++) {
      let paramsHigh = { generation: 1, analyticalDepth: 0.5, responsiveness: 0.5 };
      let paramsLow = { generation: 1, analyticalDepth: 0.5, responsiveness: 0.5 };

      let varianceHigh = 0;
      let varianceLow = 0;

      for (let i = 0; i < 200; i++) {
        const nextHigh = alphaEvolve(paramsHigh, 0.9);
        varianceHigh += Math.abs(nextHigh.analyticalDepth! - paramsHigh.analyticalDepth!);
        paramsHigh = nextHigh;

        const nextLow = alphaEvolve(paramsLow, 0.01);
        varianceLow += Math.abs(nextLow.analyticalDepth! - paramsLow.analyticalDepth!);
        paramsLow = nextLow;
      }

      if (varianceHigh > varianceLow) {
        successCount++;
      }
    }

    expect(successCount).toBeGreaterThan(5); // Majority of runs should show higher variance
  });
});
