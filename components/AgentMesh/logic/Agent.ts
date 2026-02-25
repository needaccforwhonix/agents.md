import { AgentParams, AgentState, Message } from './types';

export class Agent {
  state: AgentState;

  // Simulated topics/vocabulary for context engineering
  private vocabulary: string[] = [
    "optimization", "structure", "scalability", "latency", "async",
    "parallel", "evolution", "context", "reasoning", "security",
    "cleanliness", "order", "performance", "deployment"
  ];

  constructor(id: string, name: string) {
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
    };
  }

  public receive(message: Message): Message | null {
    // Basic context filtering: Does this message interest me?
    // "Agentic context engineering": Filters input based on internal state.

    // 1. Add to history (short-term memory)
    this.state.history.push(message);
    if (this.state.history.length > 20) {
      this.state.history.shift(); // Keep history manageable
    }

    // 2. Decide to react
    if (this.shouldRespond(message)) {
      return this.generateOutput(message);
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

  private shouldRespond(message: Message): boolean {
    if (message.senderId === this.state.id) return false; // Don't talk to self
    if (this.state.params.energy < 10) return false; // Too tired
    if (this.state.status !== 'idle') return false; // Busy or cooling down

    // Calculate interest based on topics
    const interest = message.topics.reduce((acc, topic) => {
        return acc + (this.vocabulary.includes(topic) ? 0.2 : 0);
    }, 0);

    // Probability check
    const probability = (this.state.params.responsiveness * 0.5) + interest + (this.state.params.curiosity * 0.3);
    return Math.random() < probability;
  }

  private generateOutput(triggerMessage: Message): Message {
    this.state.status = 'processing';

    // Simulate processing time and resource usage
    this.state.params.energy -= 10;

    // "Reasoning" simulation: Combine vocabulary based on creativity
    const topicCount = Math.max(1, Math.floor(this.state.params.creativity * 3));
    const selectedTopics: string[] = [];
    for (let i = 0; i < topicCount; i++) {
      const topic = this.vocabulary[Math.floor(Math.random() * this.vocabulary.length)];
      if (!selectedTopics.includes(topic)) selectedTopics.push(topic);
    }

    // Construct content
    const content = `Responding to ${triggerMessage.senderName} about ${triggerMessage.topics.join(', ')}. ` +
                    `I believe in ${selectedTopics.join(' and ')} for better ${this.state.params.aggression > 0.5 ? 'dominance' : 'cooperation'}.`;

    const response: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: this.state.id,
      senderName: this.state.name,
      content: content,
      timestamp: Date.now(),
      topics: selectedTopics
    };

    this.state.lastActionTime = Date.now();
    this.state.status = 'cooldown';
    setTimeout(() => { this.state.status = 'idle'; }, 1000); // Cooldown simulation

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
        params[key] = Math.max(0, Math.min(1, params[key]));
    });

    // Output mutation log (optional, or stored in history)
  }
}
