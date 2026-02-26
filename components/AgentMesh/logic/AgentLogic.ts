import { Message, Agent, AgentConfig, EvolutionState, AgentContext, BrainState, AgentAction, AgentTrait } from '../types';
import { ContextManager } from './ContextManager';
import { EvolutionEngine } from './EvolutionEngine';

export class AgentLogic implements Agent {
  public id: string;
  public config: AgentConfig;
  public evolution: EvolutionState;
  public context: AgentContext;
  public brainState: BrainState;

  private contextManager: ContextManager;
  private evolutionEngine: EvolutionEngine;
  private inbox: Message[] = [];
  private processing: boolean = false;

  constructor(config: AgentConfig) {
    this.id = config.id;
    this.config = config;

    // Initialize context manager
    this.contextManager = new ContextManager();
    this.context = {
      summary: "Initializing...",
      relevantHistory: [],
      currentFocus: null,
      tokenCount: 0
    };

    // Initialize evolution
    const initialEvolution: EvolutionState = {
      generation: 0,
      fitness: 0.5,
      traits: config.initialTraits
    };
    this.evolutionEngine = new EvolutionEngine(initialEvolution);
    this.evolution = initialEvolution;

    this.brainState = { isThinking: false };
  }

  public async process(message: Message): Promise<AgentAction> {
    // Add to ACE context
    this.contextManager.addMessage(message);

    // Ignore own messages
    if (message.senderId === this.id) {
      return { type: 'IGNORE' };
    }

    this.processing = true;
    this.brainState.isThinking = true;

    // 1. Get relevant context (ACE)
    // Simple logic: if message mentions my name or relevant topic, pay attention
    const relevant = this.contextManager.getRelevantContext(message.content);
    this.context = relevant;

    // 2. Check traits (AlphaEvolve)
    const assertiveness = this.evolutionEngine.getTrait('assertiveness');
    const verbosity = this.evolutionEngine.getTrait('verbosity');
    const creativity = this.evolutionEngine.getTrait('creativity');

    // 3. Decide to react (Simulated probabilistic logic)
    // Higher assertiveness = more likely to speak
    const roll = Math.random();
    const threshold = 0.8 - (assertiveness * 0.5); // Assertive agents have lower threshold

    // If directly addressed, always try to respond
    const isAddressed = message.content.includes(this.config.name);

    if (isAddressed || roll > threshold) {
      // Simulate "Thinking" delay based on complexity
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      // Construct response based on traits
      let response = `[${this.config.name}]: `;

      if (creativity > 0.7) {
        response += `Interesting point about "${message.content.substring(0, 10)}...". Let's pivot to a new perspective. `;
      } else {
        response += `I acknowledge: "${message.content.substring(0, 15)}...". `;
      }

      if (verbosity > 0.6) {
        response += `Furthermore, considering the context of ${relevant.summary}, we should optimize for parallel execution. The evolution generation is ${this.evolution.generation}.`;
      }

      // Self-evolve slightly based on "activity"
      this.evolve(0.6); // Positive reinforcement for speaking

      this.brainState.isThinking = false;
      this.processing = false;
      return { type: 'SPEAK', content: response };
    } else {
      // Just think/observe
      this.evolve(0.4); // Mild penalty for passivity? Or neutral.
      this.brainState.isThinking = false;
      this.processing = false;
      return { type: 'IGNORE' };
    }
  }

  public evolve(feedback: number): void {
    this.evolutionEngine.evolve(feedback);
    this.evolution = this.evolutionEngine.getState();
  }
}
