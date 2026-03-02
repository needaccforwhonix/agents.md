import { AgentMessage, AgentState } from './Types';
import { ASTAnalyzer } from './ASTAnalyzer';

export interface Brain {
  process(
    state: AgentState,
    inputMessage: AgentMessage,
    fullContext: AgentMessage[]
  ): Promise<AgentMessage | null>;
  mutateParameters(state: AgentState): void;
}

export class RuleBasedBrain implements Brain {
  /**
   * Evaluates if the agent should respond to the given input message.
   * This logic can be extended to utilize "Agentic Context Engineering".
   */
  public async process(
    state: AgentState,
    inputMessage: AgentMessage,
    fullContext: AgentMessage[]
  ): Promise<AgentMessage | null> {
    // Basic Agentic Context Engineering (ACE) check:
    // Ensure what, where, and how are clearly defined. If not, the agent could ask for clarification.
    // However, as a simple heuristic for the simulation, we only respond if we have something to add.

    // Analyze if there are any code blocks using our ASTAnalyzer.
    const codeBlocks = ASTAnalyzer.extractCodeBlocks(inputMessage.rawContent);
    let analysisResult = '';

    if (codeBlocks.length > 0) {
        codeBlocks.forEach(block => {
            const astData = ASTAnalyzer.analyzeCodeBlocks(block);
            if (astData.functions.length > 0 || astData.classes.length > 0) {
               analysisResult += `I noticed functions: ${astData.functions.join(', ')}. Classes: ${astData.classes.join(', ')}. `;
            }
        });
    }

    // AlphaEvolve integration:
    // Slightly adjust focus based on how much the input message aligns with our previous context
    this.mutateParameters(state);

    // Simulate token counting and cognitive load checking
    const estimatedTokens = inputMessage.rawContent.length / 4;

    // Only respond to messages that are actionable and not from ourselves
    if (inputMessage.senderId === state.id) {
        return null;
    }

    // A very simple rule: respond if the input describes what to do and we haven't responded immediately to it.
    // To prevent infinite loops, we don't respond to our own last message, and we add some randomness based on creativity.
    const shouldRespond = Math.random() < state.parameters.creativity && estimatedTokens < 1000;

    if (!shouldRespond) {
        return null; // Ignore message
    }

    // Generate output with clear intent, location, and action
    const response: AgentMessage = {
      id: crypto.randomUUID(),
      senderId: state.id,
      timestamp: Date.now(),
      what: 'Analyze and provide feedback on the previous message.',
      where: 'Agent Mesh Context',
      how: 'Using RuleBasedBrain and AST Analysis.',
      rawContent: `Acknowledged message from ${inputMessage.senderId}. ${analysisResult} My current focus is ${state.parameters.focus.toFixed(2)}.`,
      tokenCount: Math.ceil(Math.random() * 50) + 10, // Simulated token count
    };

    return response;
  }

  /**
   * "AlphaEvolve" algorithm for parameter mutation.
   * Mutates the agent's parameters to adapt to the environment over time.
   */
  public mutateParameters(state: AgentState): void {
    const mutationRate = 0.05; // 5% mutation chance

    if (Math.random() < mutationRate) {
        // Adjust temperature (0.0 to 1.0)
        state.parameters.temperature += (Math.random() - 0.5) * 0.1;
        state.parameters.temperature = Math.max(0, Math.min(1, state.parameters.temperature));
    }

    if (Math.random() < mutationRate) {
        // Adjust creativity (0.0 to 1.0)
        state.parameters.creativity += (Math.random() - 0.5) * 0.1;
        state.parameters.creativity = Math.max(0, Math.min(1, state.parameters.creativity));
    }

    if (Math.random() < mutationRate) {
        // Adjust focus (0.0 to 1.0)
        state.parameters.focus += (Math.random() - 0.5) * 0.1;
        state.parameters.focus = Math.max(0, Math.min(1, state.parameters.focus));
    }
  }
}
