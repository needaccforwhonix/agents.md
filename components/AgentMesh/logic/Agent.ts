import { AgentState, Message, ACEContext, Brain, AgentGene, AgentRole } from '../types';
import { ACE } from './ACE';

export class Agent {
  public state: AgentState;
  private brain: Brain;
  private context: ACEContext;
  private messageQueue: Message[] = [];
  private isProcessing: boolean = false;

  constructor(
    id: string,
    name: string,
    role: AgentRole,
    initialGenes: Record<string, AgentGene>,
    brain: Brain
  ) {
    this.state = {
      id,
      name,
      role,
      genes: initialGenes,
      energy: 100,
      age: 0,
      generation: 1,
      status: 'Idle',
    };
    this.brain = brain;
    this.context = {
      shortTermMemory: [],
      longTermMemory: [],
      currentGoal: 'Optimize system performance and maintain stability.',
      tokenCount: 0,
    };
  }

  /**
   * Receives a message from the Mesh.
   */
  public receive(message: Message): void {
    // Self-message check (don't talk to self unless needed)
    if (message.from === this.state.id) return;

    this.messageQueue.push(message);
    // Trigger processing loop if idle?
    // For simplicity, we might rely on an external tick or immediate trigger.
  }

  /**
   * Main act loop. Should be called periodically or on event.
   */
  public async act(): Promise<Message | null> {
    if (this.isProcessing || this.messageQueue.length === 0) return null;

    this.isProcessing = true;
    this.state.status = 'Thinking';

    const input = this.messageQueue.shift()!;

    // Update Context (ACE)
    this.context = ACE.updateContext(this.context, input);

    // Process with Brain
    // Note: Brain doesn't know WHO it is, just processes. We inject identity into prompt if using LLM.
    // For RuleBased, it's simpler.
    const output = await this.brain.process(input, this.context);

    if (output) {
      output.from = this.state.id;
      // Re-feed output into own context?
      // Yes, agents should remember what they said.
      this.context = ACE.updateContext(this.context, output);
      this.state.status = 'Acting';
    } else {
      this.state.status = 'Idle';
    }

    // Evolution Step (AlphaEvolve)
    // Every N actions or age, evolve.
    if (this.state.age % 10 === 0) {
      this.state.status = 'Evolving';
      this.state.genes = this.brain.evolve(this.state.genes);
      this.state.generation += 1;
    }

    this.state.age++;
    this.isProcessing = false;
    this.state.status = 'Idle';

    return output;
  }

  public getContext(): ACEContext {
    return this.context;
  }
}
