import { EvolutionState, AgentTrait } from '../types';

export class EvolutionEngine {
  private state: EvolutionState;

  constructor(initialState: EvolutionState) {
    this.state = initialState;
  }

  public getState(): EvolutionState {
    return this.state;
  }

  public evolve(feedback: number): void {
    // Basic implementation:
    // If feedback is positive (> 0.5), amplify current successful traits slightly.
    // If feedback is negative (< 0.5), mutate randomly to find better strategy.

    const newState = { ...this.state };
    newState.generation++;
    newState.fitness = (newState.fitness * 0.9) + (feedback * 0.1); // Moving average

    const mutationRate = feedback > 0.5 ? 0.05 : 0.2; // Higher mutation if failing

    Object.keys(newState.traits).forEach(key => {
      const trait = newState.traits[key];
      // Random drift
      let change = (Math.random() - 0.5) * mutationRate;

      // Keep within bounds [0, 1]
      let newValue = Math.max(0, Math.min(1, trait.value + change));

      newState.traits[key] = {
        ...trait,
        value: newValue
      };
    });

    this.state = newState;
  }

  public getTrait(name: string): number {
    return this.state.traits[name]?.value || 0.5;
  }
}
