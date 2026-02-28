import { BrainParams } from './types';

export class AlphaEvolve {
  private currentParams: BrainParams;

  constructor(initialParams: Partial<BrainParams> = {}) {
    this.currentParams = {
      creativity: 0.5,
      analytical: 0.5,
      decisiveness: 0.5,
      mutationRate: 0.1,
      ...initialParams,
    };
  }

  public getParams(): BrainParams {
    return { ...this.currentParams };
  }

  // Mutate slightly with each iteration, keeping values between 0.1 and 1.0
  public evolve(): BrainParams {
    const rate = this.currentParams.mutationRate;

    // Helper to mutate
    const mutate = (val: number) => {
      const delta = (Math.random() * 2 - 1) * rate; // Random delta between -rate and +rate
      const newVal = val + delta;
      return Math.max(0.1, Math.min(1.0, newVal)); // Clamp between 0.1 and 1.0
    };

    this.currentParams = {
      ...this.currentParams,
      creativity: mutate(this.currentParams.creativity),
      analytical: mutate(this.currentParams.analytical),
      decisiveness: mutate(this.currentParams.decisiveness),
      // Mutation rate also mutates, but slightly less
      mutationRate: Math.max(0.01, Math.min(0.5, this.currentParams.mutationRate + (Math.random() * 2 - 1) * 0.05)),
    };

    return this.getParams();
  }
}
