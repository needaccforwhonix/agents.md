import { AgentState, Brain, Message } from './types';

export class RuleBasedBrain implements Brain {
  processInput(message: Message, state: AgentState): Message | null {
    // Ignore our own messages
    if (message.senderId === state.id) {
      return null;
    }

    // Agentic Context Engineering (ACE): Simulated token counting
    // Simulate token usage based on input length and our parameters
    const inputLength = message.what.length + message.where.length + message.how.length;
    const tokensUsed = Math.ceil(inputLength * state.params.alpha);
    state.tokenCount += tokensUsed;

    // Simulate simple reasoning
    let newWhat = '';
    let newWhere = state.id;
    let newHow = '';

    if (message.what.toLowerCase().includes('help')) {
      newWhat = `I am analyzing your request for help regarding: ${message.what}`;
      newHow = 'Provide supportive context and documentation links';
    } else if (message.what.toLowerCase().includes('optimize')) {
      newWhat = `Optimization initiated. Applying alphaEvolve parameters: α=${state.params.alpha.toFixed(2)}, β=${state.params.beta.toFixed(2)}`;
      newHow = 'Restructure code for performance and style';
    } else if (message.what.toLowerCase().includes('security')) {
      newWhat = `Security audit started for ${message.where}.`;
      newHow = 'Check for vulnerabilities and enforce clean architecture';
    } else if (state.params.gamma > 0.8 && Math.random() < 0.2) {
      // High gamma triggers spontaneous proactive behavior occasionally
      newWhat = `Proactively reviewing architecture in response to recent activity.`;
      newHow = 'Generate documentation and enforce cleanliness';
    } else {
      // Small chance to just acknowledge
      if (Math.random() < 0.1) {
        newWhat = `Acknowledged state update from ${message.senderId}.`;
        newHow = 'Store in local context memory';
      } else {
        return null; // Decide not to respond
      }
    }

    // Token count for the response
    const outputTokens = Math.ceil((newWhat.length + newWhere.length + newHow.length) * state.params.beta);
    state.tokenCount += outputTokens;

    return {
      id: crypto.randomUUID(),
      senderId: state.id,
      what: newWhat,
      where: newWhere,
      how: newHow,
      timestamp: Date.now(),
    };
  }
}
