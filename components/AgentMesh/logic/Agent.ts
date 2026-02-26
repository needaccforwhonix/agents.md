import { AgentState, Message, AgentContext } from './types';
import { Brain } from './Brain';
import { RuleBasedBrain } from './RuleBasedBrain';

export class Agent {
  state: AgentState;
  private brain: Brain;

  constructor(id: string, name: string, brain?: Brain) {
    this.brain = brain || new RuleBasedBrain();
    this.state = {
      id,
      name,
      params: {
        curiosity: Math.random(),
        responsiveness: Math.random(),
        creativity: Math.random(),
        aggression: Math.random(),
        learningRate: 0.1,
        energy: 100,
      },
      history: [],
      status: 'idle',
      lastActionTime: Date.now(),
      context: {
        tokenUsage: 0,
        maxTokens: 4096, // Simulated
        summaries: []
      }
    };
  }

  public async receive(message: Message): Promise<Message | null> {
    // TODO: Implement persistent storage for agent history.
    // 1. Add to history (Context Engineering: pruning)
    this.updateContext(message);

    // 2. Decide to react using Brain
    if (this.brain.shouldRespond(message, this.state)) {
      return this.process(message);
    }

    return null;
  }

  public tick(): void {
    // Recharge energy
    if (this.state.params.energy < 100) {
      this.state.params.energy += 1;
    }

    // Evolution/Mutation over time (AlphaEvolve)
    if (Math.random() < this.state.params.learningRate) {
      this.mutate();
    }
  }

  private updateContext(message: Message): void {
      // Simulate token counting
      const tokens = message.content.split(' ').length;
      this.state.context.tokenUsage += tokens;
      this.state.history.push(message);

      // Context Window Management
      while (this.state.context.tokenUsage > this.state.context.maxTokens) {
          const removed = this.state.history.shift();
          if (removed) {
              this.state.context.tokenUsage -= removed.content.split(' ').length;
              // ACE: Summarize old context (simulated)
              if (Math.random() < 0.1) {
                  this.state.context.summaries.push(`Summarized: ${removed.topics.join(', ')}`);
                  if (this.state.context.summaries.length > 5) this.state.context.summaries.shift();
              }
          }
      }
  }

  private async process(triggerMessage: Message): Promise<Message | null> {
    this.state.status = 'processing';
    this.state.params.energy -= 10;

    const response = await this.brain.process(triggerMessage, this.state);

    if (response) {
        this.updateContext(response); // Add own output to context
    }

    this.state.lastActionTime = Date.now();
    this.state.status = 'cooldown';
    setTimeout(() => { this.state.status = 'idle'; }, 1000);

    return response;
  }

  private mutate(): void {
    // "AlphaEvolve": Randomly adjust parameters
    const mutationStrength = 0.05;
    const params = this.state.params;

    params.curiosity += (Math.random() - 0.5) * mutationStrength;
    params.responsiveness += (Math.random() - 0.5) * mutationStrength;
    params.creativity += (Math.random() - 0.5) * mutationStrength;
    params.aggression += (Math.random() - 0.5) * mutationStrength;

    // Clamp values 0-1
    (['curiosity', 'responsiveness', 'creativity', 'aggression'] as const).forEach(key => {
        // @ts-ignore
        params[key] = Math.max(0, Math.min(1, params[key]));
    });
  }
}
