import { Message, AgentConfig, AgentState, Brain, Context } from './types';
import { AgenticContextEngineering } from './AgenticContextEngineering';
import { AlphaEvolve } from './AlphaEvolve';
import { ASTAnalyzer } from './ASTAnalyzer';

export class Agent {
  public id: string;
  public config: AgentConfig;
  public state: AgentState;

  private brain: Brain;
  private memory: Message[] = [];

  constructor(id: string, brain: Brain, initialConfig: AgentConfig) {
    this.id = id;
    this.brain = brain;
    this.config = initialConfig;
    this.state = {
      memoryUsage: 0,
      messageCount: 0,
      isActive: true,
    };
  }

  /**
   * Receives a broadcasted output message as input.
   * Utilizes Agentic Context Engineering for bounding.
   */
  public receive(message: Message): Message | null {
    if (!this.state.isActive) return null;

    // Track state
    this.memory.push(message);
    this.state.messageCount++;

    // Agentic Context Engineering
    const rawContext: Context = {
      recentMessages: this.memory,
      tokenCount: this.state.memoryUsage,
    };

    const boundedContext = AgenticContextEngineering.summarizeAndBound(rawContext, this.config);
    this.memory = boundedContext.recentMessages;
    this.state.memoryUsage = boundedContext.tokenCount;

    // Mutate parameters using AlphaEvolve
    this.config = AlphaEvolve.evolve(this.config);

    // Let the Brain decide how to react
    const response = this.brain.process(message, boundedContext, this.config);

    if (response) {
      // Analyze any code we are returning
      if (ASTAnalyzer.hasCodeBlocks(response.what)) {
        const blocks = ASTAnalyzer.extractCodeBlocks(response.what);
        blocks.forEach((code) => {
          const analysis = ASTAnalyzer.analyzeCode(code);
          console.log(`[${this.id}] AST Analyzed Output Block: ${analysis.functions} functions, ${analysis.nodes} nodes`);
        });
      }
    }

    return response;
  }
}
