import { AgentConfig } from './types';

export class AlphaEvolve {
  /**
   * Mutates an agent's configuration based on its current mutation rate.
   * This simulates learning or adapting to the environment.
   */
  static evolve(config: AgentConfig): AgentConfig {
    const rate = config.mutationRate;

    // Mutate temperature randomly between -rate and +rate
    const tempMutation = (Math.random() * 2 - 1) * rate;
    let newTemp = config.temperature + tempMutation;

    // Constrain temperature between 0 and 1
    newTemp = Math.max(0, Math.min(1, newTemp));

    // Optionally mutate the mutation rate itself (meta-evolution)
    let newRate = config.mutationRate + (Math.random() * 0.05 - 0.025);
    newRate = Math.max(0.01, Math.min(0.5, newRate));

    return {
      ...config,
      temperature: newTemp,
      mutationRate: newRate,
    };
  }
}
