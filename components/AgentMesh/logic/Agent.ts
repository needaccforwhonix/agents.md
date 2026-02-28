import { AgentConfig, AgentContext, Message, BrainParams } from './types';
import { AgenticContextEngine } from './ACE';
import { AlphaEvolve } from './AlphaEvolve';
import { Brain, RuleBasedBrain } from './Brain';

export class Agent {
  private id: string;
  public name: string;

  private ace: AgenticContextEngine;
  private evolve: AlphaEvolve;
  private brain: Brain;

  constructor(config: AgentConfig) {
    this.id = config.id;
    this.name = config.name;
    this.ace = new AgenticContextEngine();
    this.evolve = new AlphaEvolve(config.initialParams);
    this.brain = new RuleBasedBrain(); // In a more complex system, this might be injected
  }

  public getId(): string {
    return this.id;
  }

  public getContext(): AgentContext {
    return {
      id: this.id,
      name: this.name,
      history: this.ace.getContext(),
      tokenCount: this.ace.getTokenCount(),
      params: this.evolve.getParams(),
    };
  }

  // Handle an incoming broadcast message
  public async receive(msg: Message): Promise<Message | null> {
    // 1. Add to context
    this.ace.addMessage(msg);

    // 2. AlphaEvolve mutates parameters
    const currentParams = this.evolve.evolve();

    // 3. Brain processes context + new params
    const response = await this.brain.process(this.ace.getContext(), currentParams, this.id);

    // 4. Optionally add my own response to my context (the mesh also broadcasts it, but doing it here could be fine. For true broadcast, better let Mesh do it)
    // Actually, Mesh broadcast means we get it back anyway, so let's let Mesh handle it.

    return response;
  }
}
