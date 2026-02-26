import { Brain } from './Brain';
import { Message, AgentState } from './types';
import { analyzeCode } from './ast';

export class RuleBasedBrain implements Brain {
  private vocabulary: string[] = [
    "optimization", "structure", "scalability", "latency", "async",
    "parallel", "evolution", "context", "reasoning", "security",
    "cleanliness", "order", "performance", "deployment"
  ];

  shouldRespond(message: Message, state: AgentState): boolean {
    if (message.senderId === state.id) return false;
    if (state.params.energy < 10) return false;
    if (state.status !== 'idle') return false;

    // Check for relevance
    const relevant = message.topics.some(t => this.vocabulary.includes(t));
    // Base probability + bonuses
    const probability = (state.params.responsiveness * 0.4) + (relevant ? 0.3 : 0) + (state.params.curiosity * 0.2);

    return Math.random() < probability;
  }

  async process(message: Message, state: AgentState): Promise<Message | null> {
      // TODO: Replace simulated processing with real LLM inference.
      // Check for code blocks to analyze (AST Feature)
      const codeBlockMatch = message.content.match(/```(?:typescript|js|ts)?\n([\s\S]*?)```/);
      if (codeBlockMatch) {
          const code = codeBlockMatch[1];
          const analysis = await analyzeCode(code);
          if (analysis) {
             const analysisContent = `AST Analysis: Found ${analysis.functions.length} functions (${analysis.functions.join(', ')}), ${analysis.variables.length} variables, and imports from ${analysis.imports.length} modules. Complexity score: ${analysis.complexity}.`;
             return {
                 id: Math.random().toString(36).substr(2, 9),
                 senderId: state.id,
                 senderName: state.name,
                 content: analysisContent,
                 timestamp: Date.now(),
                 topics: ['analysis', 'code', 'ast']
             };
          }
      }

      // Simulate processing delay based on content length
      const processingTime = Math.min(2000, 500 + message.content.length * 5);
      await new Promise(resolve => setTimeout(resolve, processingTime));

      const responseTopics = this.extractTopics(message.content);
      const uniqueTopics = Array.from(new Set([...responseTopics, ...message.topics])).slice(0, 3);

      // If no topics found, pick random ones from vocabulary
      if (uniqueTopics.length === 0) {
          uniqueTopics.push(this.pick(this.vocabulary));
      }

      const content = this.generateResponse(message, uniqueTopics, state);

      return {
          id: Math.random().toString(36).substr(2, 9),
          senderId: state.id,
          senderName: state.name,
          content,
          timestamp: Date.now(),
          topics: uniqueTopics
      };
  }

  private extractTopics(content: string): string[] {
      // Simple keyword extraction
      return this.vocabulary.filter(word => content.toLowerCase().includes(word));
  }

  private generateResponse(message: Message, topics: string[], state: AgentState): string {
      const templates = [
          `Regarding ${topics.join(', ')}, I suggest we prioritize ${this.pick(this.vocabulary)}.`,
          `Have you considered the impact of ${this.pick(this.vocabulary)} on ${topics[0] || 'system integrity'}?`,
          `I concur with ${message.senderName}. ${topics[0] || 'This approach'} is critical for ${state.params.aggression > 0.5 ? 'rapid deployment' : 'long-term stability'}.`,
          `Optimizing for ${topics.join(' and ')} typically yields better throughput.`,
          `We should refactor the ${topics[0] || 'core logic'} to ensure ${this.pick(this.vocabulary)}.`,
          `Analyzing ${topics.join(', ')}... The metrics suggest a need for more ${this.pick(this.vocabulary)}.`
      ];
      return templates[Math.floor(Math.random() * templates.length)];
  }

  private pick(arr: string[]): string {
      return arr[Math.floor(Math.random() * arr.length)];
  }
}
